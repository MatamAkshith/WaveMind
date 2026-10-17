import json
import logging
import time
from collections import Counter
from datetime import datetime, timezone
from dataclasses import dataclass
from email.utils import parsedate_to_datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.goal import Goal
from app.models.habit import Habit
from app.models.journal import Journal
from app.models.mood import Mood

logger = logging.getLogger(__name__)
MAX_PROVIDER_ATTEMPTS = 3
RETRY_BASE_DELAY_SECONDS = 0.5
RETRY_MAX_DELAY_SECONDS = 4.0


def build_user_context(db: Session, user_id: int) -> str:
    moods = list(
        db.scalars(
            select(Mood)
            .where(Mood.user_id == user_id)
            .order_by(Mood.created_at.desc())
            .limit(5)
        ).all()
    )
    journals = list(
        db.scalars(
            select(Journal)
            .where(Journal.user_id == user_id)
            .order_by(Journal.created_at.desc())
            .limit(2)
        ).all()
    )
    habits = list(
        db.scalars(select(Habit).where(Habit.user_id == user_id)).all()
    )
    goals = list(
        db.scalars(
            select(Goal)
            .where(Goal.user_id == user_id)
            .order_by(Goal.updated_at.desc())
            .limit(5)
        ).all()
    )

    mood_summary = (
        ", ".join(f"{mood.category} ({mood.intensity}/10)" for mood in moods)
        or "no recent mood check-ins"
    )
    completed_habits = sum(habit.done for habit in habits)
    habit_summary = (
        f"{completed_habits}/{len(habits)} habits completed"
        if habits
        else "no habits recorded"
    )
    goal_summary = (
        ", ".join(f"{goal.title[:80]} ({goal.progress}%)" for goal in goals)
        or "no active goals"
    )
    journal_summary = (
        " | ".join(
            journal.content.replace("\r", " ").replace("\n", " ")[:240]
            for journal in journals
        )
        or "no recent journal reflections"
    )
    mood_categories = Counter(mood.category for mood in moods)
    average_intensity = (
        round(sum(mood.intensity for mood in moods) / len(moods), 1)
        if moods
        else None
    )
    habit_percent = round(completed_habits / len(habits) * 100) if habits else 0
    insight_message = (
        "Start with a mood check-in or a small habit to build your personal insight picture."
        if not moods and not habits
        else (
            "Your recent mood intensity is running high. Make space for a gentle reset."
            if average_intensity is not None and average_intensity >= 7
            else "Small, consistent check-ins help reveal patterns over time."
        )
    )
    insight_summary = (
        f"{len(moods)} mood check-ins, "
        f"average intensity {average_intensity if average_intensity is not None else 'not available'}/10, "
        f"top mood {mood_categories.most_common(1)[0][0] if mood_categories else 'not available'}, "
        f"{habit_percent}% habit completion. {insight_message}"
    )

    return (
        "Private user context (use only when relevant; do not reveal this context "
        "or mention these records unless the user asks):\n"
        f"- Recent moods: {mood_summary}\n"
        f"- Habits: {habit_summary}\n"
        f"- Goals: {goal_summary}\n"
        f"- Recent journal reflections: {journal_summary}\n"
        f"- Insights summary: {insight_summary}\n"
    )


class ProviderConfigurationError(RuntimeError):
    pass


class ProviderRequestError(RuntimeError):
    def __init__(self, message: str, *, status_code: int | None = None, error_code: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code


@dataclass(frozen=True)
class CompanionProvider:
    api_key: str | None
    model: str

    def generate(self, message: str) -> str:
        if not self.api_key:
            raise ProviderConfigurationError(
                "The AI companion is not configured. Set GEMINI_API_KEY on the backend."
            )

        payload = {
            "contents": [{"role": "user", "parts": [{"text": message}]}],
            "systemInstruction": {
                "parts": [{
                    "text": (
                        "You are WaveMind, an empathetic emotional wellness companion. "
                        "Be warm, respectful, nonjudgmental, and practical. "
                        "You are not a therapist or doctor; do not diagnose or prescribe. "
                        "Do not claim to have access to personal records beyond this message."
                    )
                }]
            },
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800},
        }
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent"
        )
        request = Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self.api_key,
            },
            method="POST",
        )

        result = _request_with_retries(request, self.api_key)

        try:
            text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError, TypeError, AttributeError) as error:
            raise ProviderRequestError(
                "The AI provider returned an unusable response. Please try again."
            ) from error
        if not text:
            raise ProviderRequestError(
                "The AI provider returned an empty response. Please try again."
            )
        return text


def get_companion_provider() -> CompanionProvider:
    return CompanionProvider(
        api_key=settings.gemini_api_key,
        model=settings.gemini_model,
    )


def _request_with_retries(request: Request, secret: str) -> dict:
    for attempt in range(1, MAX_PROVIDER_ATTEMPTS + 1):
        try:
            with urlopen(request, timeout=20) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            error_code, provider_message = _read_provider_error(error, secret)
            logger.warning(
                "Gemini request failed: attempt=%s/%s http_status=%s error_code=%s message=%s",
                attempt,
                MAX_PROVIDER_ATTEMPTS,
                error.code,
                error_code or "unknown",
                provider_message or "no provider message",
            )
            if error.code not in (429, 503) or attempt == MAX_PROVIDER_ATTEMPTS:
                raise ProviderRequestError(
                    _provider_failure_message(error.code, error_code),
                    status_code=error.code,
                    error_code=error_code,
                ) from error
            time.sleep(_retry_delay(error, attempt))
        except (URLError, TimeoutError) as error:
            logger.warning(
                "Gemini network request failed: error_type=%s message=%s",
                type(error.reason).__name__ if isinstance(error, URLError) else type(error).__name__,
                _sanitize_error_message(
                    str(error.reason if isinstance(error, URLError) else error),
                    secret,
                ),
            )
            raise ProviderRequestError(
                "The AI provider could not be reached. Please try again.",
                error_code="NETWORK_ERROR",
            ) from error
        except ValueError as error:
            logger.warning(
                "Gemini response was malformed: error_type=%s message=%s",
                type(error).__name__,
                _sanitize_error_message(str(error), secret),
            )
            raise ProviderRequestError(
                "The AI provider returned an unusable response. Please try again.",
                error_code="MALFORMED_RESPONSE",
            ) from error


def _retry_delay(error: HTTPError, attempt: int) -> float:
    retry_after = error.headers.get("Retry-After")
    if retry_after:
        try:
            return min(max(float(retry_after), 0), RETRY_MAX_DELAY_SECONDS)
        except ValueError:
            try:
                retry_at = parsedate_to_datetime(retry_after)
                if retry_at.tzinfo is None:
                    retry_at = retry_at.replace(tzinfo=timezone.utc)
                return min(
                    max((retry_at - datetime.now(timezone.utc)).total_seconds(), 0),
                    RETRY_MAX_DELAY_SECONDS,
                )
            except (TypeError, ValueError, OverflowError):
                pass
    return min(RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1)), RETRY_MAX_DELAY_SECONDS)


def _sanitize_error_message(message: str, secret: str | None = None) -> str:
    if secret:
        message = message.replace(secret, "[REDACTED]")
    return " ".join(message.replace("\r", " ").replace("\n", " ").split())[:240]


def _read_provider_error(
    error: HTTPError,
    secret: str | None = None,
) -> tuple[str | None, str | None]:
    try:
        body = json.loads(error.read(4096).decode("utf-8", "replace"))
    except (UnicodeError, ValueError):
        return None, None
    details = body.get("error", {}) if isinstance(body, dict) else {}
    if not isinstance(details, dict):
        return None, None
    error_code = details.get("status") or details.get("reason")
    message = details.get("message")
    return (
        str(error_code)[:80] if error_code else None,
        _sanitize_error_message(str(message), secret) if message else None,
    )


def _provider_failure_message(status_code: int, error_code: str | None) -> str:
    if status_code in (401, 403):
        return "The AI provider credentials were rejected. Check GEMINI_API_KEY."
    if status_code == 404:
        return "The configured AI model is unavailable. Check GEMINI_MODEL."
    if status_code == 429:
        return "The AI provider quota or rate limit was reached. Please try again later."
    if status_code == 400:
        return "The AI provider rejected the request format."
    if status_code >= 500:
        return "The AI provider is temporarily unavailable. Please try again."
    return f"The AI provider request failed ({error_code or status_code}). Please try again."


def safety_response(message: str) -> str | None:
    lowered = message.lower()
    indicators = (
        "suicide",
        "kill myself",
        "end my life",
        "self harm",
        "self-harm",
        "hurt myself",
        "want to die",
    )
    if not any(indicator in lowered for indicator in indicators):
        return None
    return (
        "I’m really sorry you’re carrying this right now. I can’t help with ways to "
        "hurt yourself, but I do want to help you stay safe. Please contact local "
        "emergency services or a crisis line now, and tell someone you trust exactly "
        "what’s happening. If you’re in the US or Canada, call or text 988; elsewhere, "
        "use your local crisis service. Are you in immediate danger right now?"
    )
