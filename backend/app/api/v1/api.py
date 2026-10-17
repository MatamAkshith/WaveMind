
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    chat,
    companion,
    goals,
    habits,
    insights,
    journals,
    moods,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    moods.router,
    prefix="/moods",
    tags=["Mood Tracking"],
)

api_router.include_router(
    companion.router,
    prefix="/companion",
    tags=["AI Companion"],
)
api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chat History"],
)

api_router.include_router(
    journals.router,
    prefix="/journals",
    tags=["Journaling"],
)

api_router.include_router(
    habits.router,
    prefix="/habits",
    tags=["Habits"],
)

api_router.include_router(goals.router, prefix="/goals", tags=["Goals"])
api_router.include_router(insights.router, prefix="/insights", tags=["Insights"])
