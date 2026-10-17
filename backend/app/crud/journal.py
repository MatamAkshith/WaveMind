from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.journal import Journal
from app.schemas.journal import JournalCreate


def create_journal_entry(
    db: Session,
    user_id: int,
    data: JournalCreate,
) -> Journal:
    entry = Journal(user_id=user_id, content=data.content)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_journal_entries(db: Session, user_id: int) -> list[Journal]:
    statement = (
        select(Journal)
        .where(Journal.user_id == user_id)
        .order_by(Journal.updated_at.desc(), Journal.id.desc())
    )
    return list(db.scalars(statement).all())


def get_journal_entry(
    db: Session,
    user_id: int,
    entry_id: int,
) -> Journal | None:
    statement = select(Journal).where(
        Journal.id == entry_id,
        Journal.user_id == user_id,
    )
    return db.scalar(statement)


def delete_journal_entry(db: Session, user_id: int, entry_id: int) -> bool:
    entry = get_journal_entry(db, user_id, entry_id)
    if entry is None:
        return False

    db.delete(entry)
    db.commit()
    return True