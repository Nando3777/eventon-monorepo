# Scheduler service

FastAPI service responsible for producing staffing rosters. The current version exposes a
skeleton endpoint and includes TODO markers where OR-Tools integration will be added.

## Configuration

Configuration values are supplied via environment variables. During development the service
loads variables from a local `.env` file located in `services/scheduler/.env`. The file is
ignored when `ENVIRONMENT` is set to anything other than `development` or `local`.

| Variable | Required | Description |
| --- | --- | --- |
| `SCHEDULER_DEFAULT_TIMEZONE` | Yes | Default IANA timezone used when requests omit the `timezone` field. |
| `SCHEDULER_SERVICE_NAME` | No (defaults to `scheduler`) | Human readable name returned in health responses. |
| `SCHEDULER_PLANNER_MAX_DAYS` | No (defaults to `28`) | Upper bound on how many days of shifts are planned in one proposal. |
| `ENVIRONMENT` | No (defaults to `development`) | Set to `production` in deployed environments to disable `.env` loading. |

Example `.env` file for local development:

```
ENVIRONMENT=development
SCHEDULER_DEFAULT_TIMEZONE=Europe/London
SCHEDULER_SERVICE_NAME=eventon-scheduler
SCHEDULER_PLANNER_MAX_DAYS=21
```

## Running locally

1. Create and activate a Python virtual environment (Python 3.10+).
2. Install dependencies: `pip install -e .` from within `services/scheduler`.
3. Populate the `.env` file as described above.
4. Start the service directly with `uvicorn app.main:app --reload` or use Turbo for a
   consistent developer experience: `npx turbo run dev --filter=@eventon/scheduler`.

The health check is available at `GET /healthz` and the roster stub endpoint is exposed at
`POST /schedule/propose`.

## Development notes

- The `pyproject.toml` pins `ortools==9.10.4067` ready for future optimisation work.
- The `POST /schedule/propose` route currently returns illustrative roster data and
  highlights TODO items describing where OR-Tools will later be integrated.
