"""Configuration management for the scheduler service."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Dict

from pydantic import BaseSettings, Field, ValidationError


def _load_dotenv_if_required() -> None:
    """Populate ``os.environ`` with values from ``.env`` when in development."""

    environment = os.getenv("ENVIRONMENT", "development").lower()
    if environment not in {"development", "local"}:
        return

    env_file = Path(__file__).resolve().parent.parent / ".env"
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


class Settings(BaseSettings):
    """Typed configuration for the FastAPI application."""

    environment: str = Field(
        default="development",
        env="ENVIRONMENT",
        description="Current deployment environment (development, staging, production, ...).",
    )
    service_name: str = Field(
        default="scheduler",
        env="SCHEDULER_SERVICE_NAME",
        description="Human readable name for the service.",
    )
    default_timezone: str = Field(
        ...,
        env="SCHEDULER_DEFAULT_TIMEZONE",
        description="Fallback timezone to use when a request does not provide one.",
    )
    planner_max_days: int = Field(
        28,
        env="SCHEDULER_PLANNER_MAX_DAYS",
        description="Maximum scheduling horizon (in days) the planner will attempt to cover.",
    )

    class Config:
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings, loading ``.env`` during development."""

    _load_dotenv_if_required()
    try:
        return Settings()
    except ValidationError as exc:  # pragma: no cover - fast failure path
        message = (
            "Scheduler configuration invalid. Ensure required environment variables "
            "are defined (see services/scheduler/README.md)."
        )
        raise RuntimeError(message) from exc


def get_settings_dict() -> Dict[str, str]:
    """Expose settings as a dictionary for diagnostics and /healthz."""

    settings = get_settings()
    return {
        "environment": settings.environment,
        "service": settings.service_name,
        "defaultTimezone": settings.default_timezone,
    }
