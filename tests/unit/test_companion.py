from io import BytesIO
from types import SimpleNamespace
from urllib.error import HTTPError, URLError

import pytest
from fastapi.testclient import TestClient

from app.ai.companion import (
    CompanionProvider,
    ProviderConfigurationError,
    ProviderRequestError,
    build_user_context,
)
import app.ai.companion as companion_module
from app.api.v1.endpoints.auth import get_current_user
from app.ai.companion import get_companion_provider
from app.main import app


class FakeProvider:
    def __init__(self, reply="That sounds worth taking one gentle step at a time."):
        self.reply = reply
        self.messages = []

    def generate(self, message):
        self.messages.append(message)
        return self.reply


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return None

    def read(self):
        return self.body


@pytest.fixture
def client():
    fake_provider = FakeProvider()
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
    app.dependency_overrides[get_companion_provider] = lambda: fake_provider
    with TestClient(app) as test_client:
        yield test_client, fake_provider
    app.dependency_overrides.clear()


def test_chat_requires_authentication():
    with TestClient(app) as client:
        response = client.post("/api/v1/companion/chat", json={"message": "Hello"})
    assert response.status_code == 403


def test_chat_rejects_empty_and_oversized_messages(client):
    test_client, _ = client
    assert test_client.post("/api/v1/companion/chat", json={"message": " "}).status_code == 422
    oversized = "x" * 4001
    assert test_client.post("/api/v1/companion/chat", json={"message": oversized}).status_code == 422


def test_chat_returns_provider_response_without_persisting_message(client):
    test_client, provider = client
    response = test_client.post(
        "/api/v1/companion/chat",
        json={"message": "I feel overwhelmed by my workload."},
    )
    assert response.status_code == 200
    assert response.json()["reply"] == provider.reply
    assert len(provider.messages) == 1
    assert provider.messages[0].endswith(
        "User message:\nI feel overwhelmed by my workload."
    )
    assert "Private user context" in provider.messages[0]


def test_user_context_is_bounded_and_scoped_to_requested_user():
    class ScalarResult:
        def __init__(self, values):
            self.values = values

        def all(self):
            return self.values

    class FakeDatabase:
        def __init__(self):
            self.queries = []
            self.results = [
                ScalarResult([SimpleNamespace(category="calm", intensity=6)]),
                ScalarResult([SimpleNamespace(content="A private reflection")]),
                ScalarResult([SimpleNamespace(done=True)]),
                ScalarResult([SimpleNamespace(title="Learn Python", progress=40)]),
            ]

        def scalars(self, query):
            self.queries.append(str(query.whereclause))
            return self.results.pop(0)

    database = FakeDatabase()
    context = build_user_context(database, user_id=7)

    assert "calm (6/10)" in context
    assert "A private reflection" in context
    assert "1/1 habits completed" in context
    assert "Learn Python (40%)" in context
    assert "Insights summary:" in context
    assert "average intensity 6.0/10" in context
    assert "top mood calm" in context
    assert "100% habit completion" in context
    assert "user_id" not in context
    assert all("user_id" in query for query in database.queries)


def test_safety_message_does_not_call_provider(client):
    test_client, provider = client
    response = test_client.post(
        "/api/v1/companion/chat",
        json={"message": "I want to kill myself."},
    )
    assert response.status_code == 200
    assert response.json()["safety_intervention"] is True
    assert provider.messages == []


def test_provider_configuration_and_request_errors_are_explicit(client):
    test_client, _ = client

    class UnconfiguredProvider:
        def generate(self, message):
            raise ProviderConfigurationError("Set GEMINI_API_KEY on the backend.")

    app.dependency_overrides[get_companion_provider] = lambda: UnconfiguredProvider()
    response = test_client.post("/api/v1/companion/chat", json={"message": "Hello"})
    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]

    class FailedProvider:
        def generate(self, message):
            raise ProviderRequestError("The provider failed.")

    app.dependency_overrides[get_companion_provider] = lambda: FailedProvider()
    response = test_client.post("/api/v1/companion/chat", json={"message": "Hello again"})
    assert response.status_code == 502


@pytest.mark.parametrize(
    ("status_code", "expected_status", "expected_detail"),
    [
        (429, 429, "quota or rate limit"),
        (503, 503, "temporarily unavailable"),
    ],
)
def test_exhausted_temporary_provider_errors_have_safe_api_responses(
    client,
    status_code,
    expected_status,
    expected_detail,
):
    test_client, _ = client

    class TemporaryFailureProvider:
        def generate(self, message):
            raise ProviderRequestError(
                "provider details must not leak",
                status_code=status_code,
                error_code="PROVIDER_INTERNAL_DETAIL",
            )

    app.dependency_overrides[get_companion_provider] = lambda: TemporaryFailureProvider()
    response = test_client.post("/api/v1/companion/chat", json={"message": "Please help me reflect."})

    assert response.status_code == expected_status
    assert expected_detail in response.json()["detail"]
    assert "provider details must not leak" not in response.json()["detail"]
    assert "PROVIDER_INTERNAL_DETAIL" not in response.json()["detail"]


def test_provider_without_key_fails_without_network_call():
    with pytest.raises(ProviderConfigurationError):
        CompanionProvider(api_key=None, model="test-model").generate("Hello")


@pytest.mark.parametrize(
    ("status_code", "provider_status", "expected"),
    [
        (401, "UNAUTHENTICATED", "credentials were rejected"),
        (404, "NOT_FOUND", "configured AI model is unavailable"),
        (429, "RESOURCE_EXHAUSTED", "quota or rate limit"),
        (400, "INVALID_ARGUMENT", "rejected the request format"),
        (503, "UNAVAILABLE", "temporarily unavailable"),
    ],
)
def test_gemini_http_errors_are_classified_and_redacted(
    monkeypatch,
    caplog,
    status_code,
    provider_status,
    expected,
):
    secret = "test-secret"
    body = (
        '{"error":{"status":"%s","message":"bad request with %s"}}'
        % (provider_status, secret)
    ).encode()
    error = HTTPError(
        "https://example.test",
        status_code,
        "provider failure",
        {},
        BytesIO(body),
    )
    monkeypatch.setattr(companion_module, "urlopen", lambda *args, **kwargs: (_ for _ in ()).throw(error))

    with caplog.at_level("WARNING"):
        with pytest.raises(ProviderRequestError, match=expected):
            CompanionProvider(api_key=secret, model="test-model").generate("private user message")

    assert str(status_code) in caplog.text
    assert provider_status in caplog.text
    assert secret not in caplog.text
    assert "private user message" not in caplog.text


def test_gemini_network_failure_is_classified(monkeypatch, caplog):
    monkeypatch.setattr(
        companion_module,
        "urlopen",
        lambda *args, **kwargs: (_ for _ in ()).throw(URLError("connection refused")),
    )

    with caplog.at_level("WARNING"):
        with pytest.raises(ProviderRequestError, match="could not be reached"):
            CompanionProvider(api_key="test-secret", model="test-model").generate("Hello")

    assert "NETWORK_ERROR" not in caplog.text
    assert "connection refused" in caplog.text


@pytest.mark.parametrize("timeout_error", [TimeoutError(), URLError(TimeoutError())])
def test_gemini_timeout_is_classified_as_temporary_connection_failure(
    monkeypatch,
    timeout_error,
):
    monkeypatch.setattr(
        companion_module,
        "urlopen",
        lambda *args, **kwargs: (_ for _ in ()).throw(timeout_error),
    )

    with pytest.raises(ProviderRequestError, match="could not be reached") as raised:
        CompanionProvider(api_key="test-secret", model="test-model").generate("Hello")

    assert raised.value.error_code == "NETWORK_ERROR"


def test_transient_503_retries_then_succeeds(monkeypatch):
    failures = [
        HTTPError("https://example.test", 503, "busy", {}, BytesIO(b'{"error":{"status":"UNAVAILABLE"}}')),
        HTTPError("https://example.test", 503, "busy", {}, BytesIO(b'{"error":{"status":"UNAVAILABLE"}}')),
    ]
    response = FakeResponse(
        b'{"candidates":[{"content":{"parts":[{"text":"Recovered"}]}}]}',
    )
    calls = []

    def fake_urlopen(request, timeout):
        calls.append(request)
        if failures:
            raise failures.pop(0)
        return response

    delays = []
    monkeypatch.setattr(companion_module, "urlopen", fake_urlopen)
    monkeypatch.setattr(companion_module.time, "sleep", delays.append)

    result = CompanionProvider(api_key="test-secret", model="test-model").generate("Hello")

    assert result == "Recovered"
    assert len(calls) == 3
    assert delays == [0.5, 1.0]
    assert calls[0].headers["X-goog-api-key"] == "test-secret"


def test_retry_after_header_is_respected_and_bounded(monkeypatch):
    error = HTTPError(
        "https://example.test",
        429,
        "limited",
        {"Retry-After": "20"},
        BytesIO(b'{"error":{"status":"RESOURCE_EXHAUSTED"}}'),
    )
    monkeypatch.setattr(companion_module, "urlopen", lambda *args, **kwargs: (_ for _ in ()).throw(error))
    delays = []
    monkeypatch.setattr(companion_module.time, "sleep", delays.append)

    with pytest.raises(ProviderRequestError):
        CompanionProvider(api_key="test-secret", model="test-model").generate("Hello")

    assert delays == [4.0, 4.0]


def test_exhausted_transient_retries_raise_provider_error(monkeypatch):
    def fake_urlopen(*args, **kwargs):
        raise HTTPError(
            "https://example.test",
            503,
            "busy",
            {},
            BytesIO(b'{"error":{"status":"UNAVAILABLE"}}'),
        )

    monkeypatch.setattr(companion_module, "urlopen", fake_urlopen)
    delays = []
    monkeypatch.setattr(companion_module.time, "sleep", delays.append)

    with pytest.raises(ProviderRequestError, match="temporarily unavailable"):
        CompanionProvider(api_key="test-secret", model="test-model").generate("Hello")

    assert delays == [0.5, 1.0]


def test_permanent_404_is_not_retried(monkeypatch):
    calls = []

    def fake_urlopen(*args, **kwargs):
        calls.append(1)
        raise HTTPError(
            "https://example.test",
            404,
            "missing",
            {},
            BytesIO(b'{"error":{"status":"NOT_FOUND"}}'),
        )

    monkeypatch.setattr(companion_module, "urlopen", fake_urlopen)
    monkeypatch.setattr(companion_module.time, "sleep", lambda _: pytest.fail("unexpected retry"))

    with pytest.raises(ProviderRequestError, match="model is unavailable"):
        CompanionProvider(api_key="test-secret", model="test-model").generate("Hello")

    assert calls == [1]
