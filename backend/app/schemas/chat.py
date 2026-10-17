from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints


ChatMessageText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=4000),
]


class CompanionChatRequest(BaseModel):
    message: ChatMessageText
    conversation_id: int | None = None
    client_message_id: str | None = Field(default=None, max_length=80)


class CompanionChatResponse(BaseModel):
    reply: str = Field(min_length=1)
    safety_intervention: bool = False
    conversation_id: int
    user_message_id: int
    assistant_message_id: int