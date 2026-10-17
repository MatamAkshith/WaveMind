from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


HabitTitle = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=120),
]
HabitDetail = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=255),
]


class HabitCreate(BaseModel):
    title: HabitTitle
    detail: HabitDetail | None = None


class HabitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    detail: str | None
    done: bool
    created_at: datetime
    updated_at: datetime