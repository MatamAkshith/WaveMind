from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


GoalTitle = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=160),
]
GoalDescription = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=2000),
]


class GoalCreate(BaseModel):
    title: GoalTitle
    description: GoalDescription | None = None


class GoalProgressUpdate(BaseModel):
    progress: int = Field(ge=0, le=100)


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    progress: int
    created_at: datetime
    updated_at: datetime