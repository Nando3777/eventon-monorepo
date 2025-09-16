"""Entrypoint for the scheduler FastAPI application."""

from __future__ import annotations

from fastapi import FastAPI

from .api.routes import router as schedule_router
from .config import get_settings_dict


def create_app() -> FastAPI:
    """Construct the FastAPI application instance."""

    settings = get_settings_dict()
    app = FastAPI(
        title="EventOn Scheduler Service",
        version="0.1.0",
        description=(
            "Stub scheduler service exposing scheduling endpoints and a health check."
        ),
    )

    @app.get("/healthz", tags=["health"])
    async def healthz() -> dict:
        """Simple health check endpoint."""

        return {"status": "ok", **settings}

    app.include_router(schedule_router)

    return app


app = create_app()


if __name__ == "__main__":  # pragma: no cover - convenience for manual runs
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
