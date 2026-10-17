
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from typing import Annotated


MoodCategory = Literal[
    "happy",
    "calm",
    "neutral",
    "sad",
    "anxious",
    "angry",
    "stressed",
    "excited",
    "tired",
]

ReflectionText = Annotated[
    str,
    StringConstraints(strip_whitespace=True, max_length=2000),
]


class MoodCreate(BaseModel):
    category: MoodCategory
    intensity: int = Field(ge=1, le=10)
    reflection: ReflectionText | None = None


class MoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: MoodCategory
    intensity: int
    reflection: str | None
    created_at: datetime
