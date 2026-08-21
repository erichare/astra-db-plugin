# Application architecture

## Object hierarchy

`DataAPIClient` → `Database` → `Collection` / `Table`

- **DataAPIClient**: top-level entry point; also yields an `AstraAdmin` (e.g. find embedding providers).
- **Database**: yields Collections/Tables; also yields a `DatabaseAdmin` (create/list/delete keyspaces).
- **Collection**: read/search/write documents.
- **Table**: read/search/write rows, create indexes.

**"Get" vs "Create"**: "getting" an object (spawning a client-side instance) is instant and lightweight — it does not create anything on the DB. "Creating" (e.g. create a collection) is a DB call (macroscopic time).

## Application startup

Spawn one `DataAPIClient`, one `Database`, and the needed Collection/Table objects.

- **Creation** (collections/tables) can happen at startup or in a one-off init script.
  - Collection creation is idempotent if settings match (re-creating is a no-op, ~1–2 s).
  - Table creation fails if the table exists unless `ifNotExists` is set (no config conformity check).
- **Getting** a collection/table is cheap enough to do per-request, or keep a global instance — but mind language-specific concurrency rules for globals.

## Secrets

A `DataAPIClient` needs an API Endpoint and a Token.

Easiest setup: generate a dotenv via the CLI (see `astra-cli/README.md`) and load it in the app. **Do this by default when prototyping an application.**

## Async API

Prefer async client methods where available (e.g. Python). They wrap HTTP calls more efficiently, yielding a lighter, more responsive application.
