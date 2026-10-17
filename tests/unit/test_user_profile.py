from types import SimpleNamespace

from app.core.security import hash_password, verify_password
from app.crud.user import update_user_password, update_user_profile
from app.schemas.user import PasswordChange, UserProfileUpdate


class FakeSession:
    def __init__(self):
        self.commits = 0

    def commit(self):
        self.commits += 1

    def refresh(self, _user):
        return None


def test_profile_update_persists_name_and_normalized_email():
    db = FakeSession()
    user = SimpleNamespace(email="old@example.com", full_name="Old Name")

    updated = update_user_profile(
        db,
        user,
        UserProfileUpdate(email="  New@Example.com ", full_name=" New Name "),
    )

    assert updated.email == "new@example.com"
    assert updated.full_name == "New Name"
    assert db.commits == 1


def test_password_update_replaces_hash_without_exposing_password():
    db = FakeSession()
    user = SimpleNamespace(hashed_password=hash_password("old-password"))

    update_user_password(
        db,
        user,
        PasswordChange(
            current_password="old-password",
            new_password="new-password",
        ),
    )

    assert verify_password("new-password", user.hashed_password)
    assert not verify_password("old-password", user.hashed_password)
    assert db.commits == 1
