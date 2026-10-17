from types import SimpleNamespace

from app.crud.chat import add_message, get_conversation, get_messages
from app.models.conversation import Conversation


class FakeScalarResult:
    def __init__(self, values):
        self.values = values

    def all(self):
        return self.values


class FakeSession:
    def __init__(self, values=None, scalar_value=None):
        self.values = values or []
        self.scalar_value = scalar_value
        self.statement = None
        self.added = []
        self.commits = 0

    def add(self, value):
        self.added.append(value)

    def flush(self):
        self.added[-1].id = 11
        if self.added[-1].created_at is None:
            self.added[-1].created_at = SimpleNamespace()

    def commit(self):
        self.commits += 1

    def refresh(self, _value):
        return None

    def scalar(self, statement):
        self.statement = statement
        return self.scalar_value

    def scalars(self, statement):
        self.statement = statement
        return FakeScalarResult(self.values)


def test_add_message_persists_user_scoped_message_and_timestamp():
    db = FakeSession()
    conversation = Conversation(id=4, user_id=9, title="Reflection")

    message = add_message(db, conversation, 9, "user", "I feel calm.", "client-1")

    assert message.conversation_id == 4
    assert message.user_id == 9
    assert message.role == "user"
    assert message.content == "I feel calm."
    assert message.client_message_id == "client-1"
    assert db.commits == 1


def test_messages_query_is_user_scoped_and_ordered_oldest_first():
    db = FakeSession(values=[])

    get_messages(db, user_id=9, conversation_id=4)

    assert "chat_messages.user_id" in str(db.statement.whereclause)
    assert "chat_messages.conversation_id" in str(db.statement.whereclause)
    assert "ASC" in str(db.statement)


def test_conversation_lookup_cannot_cross_user_boundary():
    db = FakeSession()

    get_conversation(db, user_id=9, conversation_id=4)

    query = str(db.statement.whereclause)
    assert "conversations.user_id" in query
    assert "conversations.id" in query
