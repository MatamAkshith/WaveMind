from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.conversation import Conversation


def create_conversation(
    db: Session,
    user_id: int,
    title: str = "New conversation",
) -> Conversation:
    conversation = Conversation(user_id=user_id, title=title[:120])
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversations(db: Session, user_id: int) -> list[Conversation]:
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
    )
    return list(db.scalars(statement).all())


def get_conversation(
    db: Session,
    user_id: int,
    conversation_id: int,
) -> Conversation | None:
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    )
    return db.scalar(statement)


def get_messages(
    db: Session,
    user_id: int,
    conversation_id: int,
) -> list[ChatMessage]:
    statement = (
        select(ChatMessage)
        .where(
            ChatMessage.conversation_id == conversation_id,
            ChatMessage.user_id == user_id,
        )
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
    )
    return list(db.scalars(statement).all())


def get_message_by_client_id(
    db: Session,
    user_id: int,
    conversation_id: int,
    client_message_id: str,
) -> ChatMessage | None:
    statement = select(ChatMessage).where(
        ChatMessage.user_id == user_id,
        ChatMessage.conversation_id == conversation_id,
        ChatMessage.client_message_id == client_message_id,
    )
    return db.scalar(statement)


def add_message(
    db: Session,
    conversation: Conversation,
    user_id: int,
    role: str,
    content: str,
    client_message_id: str | None = None,
) -> ChatMessage:
    message = ChatMessage(
        conversation_id=conversation.id,
        user_id=user_id,
        role=role,
        content=content,
        client_message_id=client_message_id,
    )
    db.add(message)
    db.flush()
    conversation.updated_at = message.created_at
    db.commit()
    db.refresh(message)
    return message