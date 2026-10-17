from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.habit import Habit
from app.schemas.habit import HabitCreate


def create_habit(db: Session, user_id: int, data: HabitCreate) -> Habit:
    habit = Habit(
        user_id=user_id,
        title=data.title,
        detail=data.detail,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def get_habits(db: Session, user_id: int) -> list[Habit]:
    statement = (
        select(Habit)
        .where(Habit.user_id == user_id)
        .order_by(Habit.created_at.asc(), Habit.id.asc())
    )
    return list(db.scalars(statement).all())


def get_habit(db: Session, user_id: int, habit_id: int) -> Habit | None:
    statement = select(Habit).where(
        Habit.id == habit_id,
        Habit.user_id == user_id,
    )
    return db.scalar(statement)


def set_habit_done(
    db: Session,
    user_id: int,
    habit_id: int,
    done: bool,
) -> Habit | None:
    habit = get_habit(db, user_id, habit_id)
    if habit is None:
        return None

    habit.done = done
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, user_id: int, habit_id: int) -> bool:
    habit = get_habit(db, user_id, habit_id)
    if habit is None:
        return False

    db.delete(habit)
    db.commit()
    return True