# camping-trip

Implementation and governance for the Phase 1 camping gear intelligence product.

## DB Startup

Start local dev + preview-like Postgres with one command:

```bash
npm run db:up
```

This creates/starts:

- `camping-dev-db` on `localhost:5432` (`camping_trip_dev`)
- `camping-preview-db` on `localhost:5433` (`camping_trip_preview`)

Then copy env vars from `.env.example` (or use the values printed by `db:up`).

## Quick Start (Personal Machine)

For database setup and `T13` closeout on a personal machine, use:

- [docs/runbooks/personal-machine-db-setup.md](docs/runbooks/personal-machine-db-setup.md)

## Current State

- `T10`: Done
- `T11`: Done
- `T12`: Done
- `T13`: Done
- `T81`: Done
- `T82`: Done
- `T84`: Done
- `T85`: Done

See [AGENTS.md](AGENTS.md) and [.agent/execplans/v1-implementation.md](.agent/execplans/v1-implementation.md) for authoritative status.
