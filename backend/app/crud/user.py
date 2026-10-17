
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import PasswordChange, UserCreate, UserProfileUpdate


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()
    statement = select(User).where(User.email == normalized_email)
    return db.scalar(statement)


def get_user_by_id(db: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id)
    return db.scalar(statement)


def create_user(db: Session, user_data: UserCreate) -> User:
    user = User(
        email=user_data.email.strip().lower(),
        full_name=user_data.full_name.strip(),
        hashed_password=hash_password(user_data.password),
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user_profile(
    db: Session,
    user: User,
    user_data: UserProfileUpdate,
) -> User:
    if user_data.email is not None:
        user.email = user_data.email
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    db.commit()
    db.refresh(user)
    return user


def update_user_password(
    db: Session,
    user: User,
    password_data: PasswordChange,
) -> User:
    user.hashed_password = hash_password(password_data.new_password)
    db.commit()
    db.refresh(user)
    return user
