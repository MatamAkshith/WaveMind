from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


JournalContent = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=10000),
]


class JournalCreate(BaseModel):
    content: JournalContent


class JournalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    created_at: datetime
    updated_at: datetime