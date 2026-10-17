from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.crud.goal import (
    create_goal,
    delete_goal,
    get_goals,
    update_goal_progress,
)
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalProgressUpdate, GoalResponse

router = APIRouter()


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal_entry(
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_goal(db, current_user.id, data)


@router.get("", response_model=list[GoalResponse])
def list_goal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_goals(db, current_user.id)


@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    data: GoalProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = update_goal_progress(db, current_user.id, goal_id, data.progress)
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not delete_goal(db, current_user.id, goal_id):
        raise HTTPException(status_code=404, detail="Goal not found")
    return None