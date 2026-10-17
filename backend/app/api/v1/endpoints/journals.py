from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.crud.journal import (
    create_journal_entry,
    delete_journal_entry,
    get_journal_entries,
    get_journal_entry,
)
from app.models.user import User
from app.schemas.journal import JournalCreate, JournalResponse

router = APIRouter()


@router.post(
    "",
    response_model=JournalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_entry(
    data: JournalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_journal_entry(db, current_user.id, data)


@router.get("", response_model=list[JournalResponse])
def list_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_journal_entries(db, current_user.id)


@router.get("/{entry_id}", response_model=JournalResponse)
def read_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = get_journal_entry(db, current_user.id, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not delete_journal_entry(db, current_user.id, entry_id):
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return None