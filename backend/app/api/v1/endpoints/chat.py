from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.crud.chat import (
    create_conversation,
    get_conversation,
    get_conversations,
    get_messages,
)
from app.models.user import User
from app.schemas.conversation import ChatMessageResponse, ConversationResponse

router = APIRouter()


@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_conversations(db, current_user.id)


@router.post(
    "/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_conversation(db, current_user.id)


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[ChatMessageResponse],
)
def list_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if get_conversation(db, current_user.id, conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return get_messages(db, current_user.id, conversation_id)