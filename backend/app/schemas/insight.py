from pydantic import BaseModel


class InsightSummary(BaseModel):
    mood_count: int
    average_mood_intensity: float | None
    top_mood: str | None
    habit_count: int
    completed_habit_count: int
    habit_completion_percent: int
    message: str