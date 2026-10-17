
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.crud.mood import (
    create_mood,
    delete_mood,
    get_mood,
    get_moods,
)
from app.models.user import User
from app.schemas.mood import MoodCreate, MoodResponse

router = APIRouter()


@router.post(
    "",
    response_model=MoodResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_mood_entry(
    data: MoodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_mood(db, current_user.id, data)


@router.get("", response_model=list[MoodResponse])
def list_mood_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_moods(db, current_user.id)


@router.get("/{mood_id}", response_model=MoodResponse)
def read_mood_entry(
    mood_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mood = get_mood(db, current_user.id, mood_id)
    if mood is None:
        raise HTTPException(status_code=404, detail="Mood entry not found")
    return mood


@router.delete("/{mood_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_mood_entry(
    mood_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not delete_mood(db, current_user.id, mood_id):
        raise HTTPException(status_code=404, detail="Mood entry not found")
    return None
