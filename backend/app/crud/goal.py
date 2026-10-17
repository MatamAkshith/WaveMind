from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalCreate


def create_goal(db: Session, user_id: int, data: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user_id,
        title=data.title,
        description=data.description,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goals(db: Session, user_id: int) -> list[Goal]:
    statement = (
        select(Goal)
        .where(Goal.user_id == user_id)
        .order_by(Goal.updated_at.desc(), Goal.id.desc())
    )
    return list(db.scalars(statement).all())


def get_goal(db: Session, user_id: int, goal_id: int) -> Goal | None:
    statement = select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
    return db.scalar(statement)


def update_goal_progress(
    db: Session,
    user_id: int,
    goal_id: int,
    progress: int,
) -> Goal | None:
    goal = get_goal(db, user_id, goal_id)
    if goal is None:
        return None
    goal.progress = progress
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, user_id: int, goal_id: int) -> bool:
    goal = get_goal(db, user_id, goal_id)
    if goal is None:
        return False
    db.delete(goal)
    db.commit()
    return True