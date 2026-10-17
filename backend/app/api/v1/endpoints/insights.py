from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.habit import Habit
from app.models.mood import Mood
from app.models.user import User
from app.schemas.insight import InsightSummary

router = APIRouter()


@router.get("/summary", response_model=InsightSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    moods = list(db.scalars(select(Mood).where(Mood.user_id == current_user.id)).all())
    habits = list(db.scalars(select(Habit).where(Habit.user_id == current_user.id)).all())
    categories = Counter(mood.category for mood in moods)
    average = (
        round(sum(mood.intensity for mood in moods) / len(moods), 1)
        if moods
        else None
    )
    completed = sum(habit.done for habit in habits)
    percent = round(completed / len(habits) * 100) if habits else 0
    if not moods and not habits:
        message = "Start with a mood check-in or a small habit to build your personal insight picture."
    elif average is not None and average >= 7:
        message = "Your recent mood intensity is running high. Make space for a gentle reset."
    else:
        message = "Small, consistent check-ins help reveal patterns over time."
    return InsightSummary(
        mood_count=len(moods),
        average_mood_intensity=average,
        top_mood=categories.most_common(1)[0][0] if categories else None,
        habit_count=len(habits),
        completed_habit_count=completed,
        habit_completion_percent=percent,
        message=message,
    )