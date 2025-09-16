# EventOn Monorepo

A pnpm + Turborepo workspace that powers the EventOn platform. It brings together the Next.js web
application, the TypeScript core API, shared UI/config packages, and the Python-based scheduling
service in a single developer workflow.

## Structure

```
.
├── apps
│   ├── core-api        # Node.js/TypeScript API service
│   └── web             # Next.js 14 application
├── packages
│   ├── config          # Shared ESLint, Prettier, and TypeScript configs
│   └── ui              # Reusable React component library
└── services
    └── scheduler       # Python scheduler built on OR-Tools
```

## Getting started

1. Install pnpm (v8+) if it is not already available.
2. Install workspace dependencies:

   ```bash
   pnpm install
   ```

3. Run any of the common workflows via the Turborepo pipelines:

   ```bash
   pnpm dev    # Runs all package "dev" scripts in parallel
   pnpm build  # Builds every workspace
   pnpm lint   # Lints all workspaces
   pnpm test   # Executes test runners (currently pass with no tests)
   ```

Each package exposes its own scripts, so you can scope commands to a single project using
`turborepo`'s filtering. For example, to develop only the Next.js application:

```bash
pnpm dev --filter @eventon/web
```

## Shared configuration

The `packages/config` workspace exports reusable ESLint, Prettier, and TypeScript presets. Other
packages consume these presets through the `@eventon/config` workspace dependency, ensuring a single
source of truth for code quality rules and compiler settings.

## Python scheduler service

The OR-Tools powered scheduler lives in `services/scheduler`. Install its dependencies with pip when
working on the service:

```bash
cd services/scheduler
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

The sample entrypoint (`src/main.py`) demonstrates how to construct a simple CP-SAT schedule.

## Formatting

Prettier is available across the repository. Run the formatter in check mode with:

```bash
pnpm format
```

To automatically fix formatting issues, append `--write` to the command.
