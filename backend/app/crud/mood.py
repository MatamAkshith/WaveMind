
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood import Mood
from app.schemas.mood import MoodCreate


def create_mood(db: Session, user_id: int, data: MoodCreate) -> Mood:
    mood = Mood(
        user_id=user_id,
        category=data.category,
        intensity=data.intensity,
        reflection=data.reflection,
    )
    db.add(mood)
    db.commit()
    db.refresh(mood)
    return mood


def get_moods(db: Session, user_id: int) -> list[Mood]:
    statement = (
        select(Mood)
        .where(Mood.user_id == user_id)
        .order_by(Mood.created_at.desc(), Mood.id.desc())
    )
    return list(db.scalars(statement).all())


def get_mood(db: Session, user_id: int, mood_id: int) -> Mood | None:
    statement = select(Mood).where(
        Mood.id == mood_id,
        Mood.user_id == user_id,
    )
    return db.scalar(statement)


def delete_mood(db: Session, user_id: int, mood_id: int) -> bool:
    mood = get_mood(db, user_id, mood_id)
    if mood is None:
        return False

    db.delete(mood)
    db.commit()
    return True
