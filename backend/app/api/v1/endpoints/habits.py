from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.crud.habit import (
    create_habit,
    delete_habit,
    get_habits,
    set_habit_done,
)
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitResponse

router = APIRouter()


@router.post(
    "",
    response_model=HabitResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_habit_entry(
    data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_habit(db, current_user.id, data)


@router.get("", response_model=list[HabitResponse])
def list_habit_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_habits(db, current_user.id)


@router.patch("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    done: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = set_habit_done(db, current_user.id, habit_id, done)
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not delete_habit(db, current_user.id, habit_id):
        raise HTTPException(status_code=404, detail="Habit not found")
    return None