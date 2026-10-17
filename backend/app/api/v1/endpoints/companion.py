from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.companion import (
    CompanionProvider,
    ProviderConfigurationError,
    ProviderRequestError,
    build_user_context,
    get_companion_provider,
    safety_response,
)
from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.crud.chat import (
    add_message,
    create_conversation,
    get_conversation,
    get_message_by_client_id,
    get_messages,
)
from app.models.user import User
from app.schemas.chat import CompanionChatRequest, CompanionChatResponse

router = APIRouter()


@router.post("/chat", response_model=CompanionChatResponse)
def chat(
    data: CompanionChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    provider: CompanionProvider = Depends(get_companion_provider),
):
    conversation = (
        get_conversation(db, current_user.id, data.conversation_id)
        if data.conversation_id is not None
        else None
    )
    if data.conversation_id is not None and conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conversation is None:
        conversation = create_conversation(
            db,
            current_user.id,
            data.message[:120],
        )

    existing_user_message = (
        get_message_by_client_id(
            db,
            current_user.id,
            conversation.id,
            data.client_message_id,
        )
        if data.client_message_id
        else None
    )
    if existing_user_message is None:
        user_message = add_message(
            db,
            conversation,
            current_user.id,
            "user",
            data.message,
            data.client_message_id,
        )
    else:
        user_message = existing_user_message
        existing_messages = get_messages(db, current_user.id, conversation.id)
        existing_assistant = next(
            (
                message
                for message in existing_messages
                if message.role == "assistant"
                and message.id > existing_user_message.id
            ),
            None,
        )
        if existing_assistant is not None:
            return CompanionChatResponse(
                reply=existing_assistant.content,
                conversation_id=conversation.id,
                user_message_id=user_message.id,
                assistant_message_id=existing_assistant.id,
            )

    intervention = safety_response(data.message)
    if intervention:
        assistant_message = add_message(
            db,
            conversation,
            current_user.id,
            "assistant",
            intervention,
        )
        return CompanionChatResponse(
            reply=intervention,
            safety_intervention=True,
            conversation_id=conversation.id,
            user_message_id=user_message.id,
            assistant_message_id=assistant_message.id,
        )

    try:
        history = get_messages(db, current_user.id, conversation.id)
        history_text = "\n".join(
            f"{message.role.title()}: {message.content}"
            for message in history[-10:]
        )
        reply = provider.generate(
            f"{build_user_context(db, current_user.id)}\n"
            f"Conversation history:\n{history_text}\n"
            f"User message:\n{data.message}"
        )
    except ProviderConfigurationError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error
    except ProviderRequestError as error:
        response_status = status.HTTP_502_BAD_GATEWAY
        detail = "The AI provider request failed. Please try again."
        if error.status_code == 429:
            response_status = status.HTTP_429_TOO_MANY_REQUESTS
            detail = "The AI provider quota or rate limit was reached. Please try again later."
        elif error.status_code in (400,):
            response_status = status.HTTP_400_BAD_REQUEST
            detail = "The AI provider rejected the request format."
        elif error.status_code in (401, 403, 404) or (
            error.status_code is not None and error.status_code >= 500
        ):
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
            if error.status_code in (401, 403):
                detail = "The AI provider credentials were rejected. Please contact support."
            elif error.status_code == 404:
                detail = "The configured AI model is unavailable. Please contact support."
            else:
                detail = "The AI provider is temporarily unavailable. Please try again."
        raise HTTPException(
            status_code=response_status,
            detail=detail,
        ) from error
    assistant_message = add_message(
        db,
        conversation,
        current_user.id,
        "assistant",
        reply,
    )
    return CompanionChatResponse(
        reply=reply,
        conversation_id=conversation.id,
        user_message_id=user_message.id,
        assistant_message_id=assistant_message.id,
    )
