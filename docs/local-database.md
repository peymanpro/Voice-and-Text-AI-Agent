# Local database workflows

The API supports two local database modes. Choose **one** mode for an API process:

- **SQLite** is the quickest path and needs no Docker or hosted credentials.
- **PostgreSQL** is the canonical deployed engine. Use the Compose service in this repository when you need local migration and driver parity.

The API rejects a configuration that sets both `DATABASE_URL` and `SQLITE_DATABASE`. Hosted environments (Railway/Vercel/production) require PostgreSQL; a local SQLite file is not persistent storage for a deployed function.

## 1. SQLite

### Fast tests (in-memory)

No setup is required:

```bash
pnpm --filter @voice-and-text-ai-agent/api test
```

The API test suite creates a fresh in-memory SQLite database, runs the migrations, and destroys it after each test. It does not need Docker, Railway, a model key, or a speech provider.

### Persistent local SQLite for manual development

Use a file when you want the schema and data to survive API restarts. From the repository root:

**PowerShell**

```powershell
New-Item -ItemType Directory -Force apps/api/.local | Out-Null
$env:NODE_ENV = "development"
$env:SQLITE_DATABASE = (Join-Path (Resolve-Path "apps/api/.local").Path "voice-agent.sqlite")
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

pnpm --filter @voice-and-text-ai-agent/api build
pnpm --filter @voice-and-text-ai-agent/api migration:run
pnpm --filter @voice-and-text-ai-agent/api dev
```

**Bash**

```bash
mkdir -p apps/api/.local
export NODE_ENV=development
export SQLITE_DATABASE="$PWD/apps/api/.local/voice-agent.sqlite"
unset DATABASE_URL

pnpm --filter @voice-and-text-ai-agent/api build
pnpm --filter @voice-and-text-ai-agent/api migration:run
pnpm --filter @voice-and-text-ai-agent/api dev
```

Run the migration after building because the TypeORM CLI points to `apps/api/dist/database/data-source.js`. Keep the same `SQLITE_DATABASE` value in the migration and API terminal. The `.gitignore` excludes SQLite files; the local database must not be committed.

The default `:memory:` database is process-local. Running the migration CLI and then starting the API in separate processes does **not** preserve an in-memory database between those processes. Use the file path above for persistent manual development.

## 2. PostgreSQL with Docker Compose

Prerequisites: Docker Engine/Desktop with the Compose plugin. The supplied `compose.yaml` starts only PostgreSQL 16. The port is bound to loopback (`127.0.0.1`), and the named volume preserves local data across container restarts.

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

Wait until the `postgres` service reports `healthy`. Then point the API at this local instance.

**PowerShell**

```powershell
$env:NODE_ENV = "development"
$env:DATABASE_URL = "postgresql://postgres:local_dev_only_change_me@127.0.0.1:5432/voice_agent"
Remove-Item Env:SQLITE_DATABASE -ErrorAction SilentlyContinue

pnpm --filter @voice-and-text-ai-agent/api build
pnpm --filter @voice-and-text-ai-agent/api migration:run
pnpm --filter @voice-and-text-ai-agent/api dev
```

**Bash**

```bash
export NODE_ENV=development
export DATABASE_URL="postgresql://postgres:local_dev_only_change_me@127.0.0.1:5432/voice_agent"
unset SQLITE_DATABASE

pnpm --filter @voice-and-text-ai-agent/api build
pnpm --filter @voice-and-text-ai-agent/api migration:run
pnpm --filter @voice-and-text-ai-agent/api dev
```

The username, password, database name, and port in this Compose file are **local-development defaults only**. They are not production credentials and must never be copied to Railway, committed as real secrets, or reused for a public database. Configure deployed services with their own secret-managed `DATABASE_URL`.

### Running the PostgreSQL integration test locally

The migration integration test applies and then rolls back the schema. Give it a **separate disposable test database**; do not point `TEST_DATABASE_URL` at `voice_agent` or any database containing data you need.

Create the test database once:

```bash
docker compose exec postgres createdb -U postgres voice_agent_test
```

Then set `TEST_DATABASE_URL` to:

```text
postgresql://postgres:local_dev_only_change_me@127.0.0.1:5432/voice_agent_test
```

Run the API test suite with that environment variable set. On PowerShell, set it using `$env:TEST_DATABASE_URL = "…"`; on Bash, use `export TEST_DATABASE_URL="…"`. The integration test is conditional and is skipped when `TEST_DATABASE_URL` is absent. Its migration rollback removes the test schema, so use only the dedicated disposable database.

## 3. Stop and reset local data

Stopping the container does not delete PostgreSQL data:

```bash
docker compose down
```

<blockquote>
  **Destructive reset warning:** `docker compose down --volumes` deletes the named PostgreSQL volume and all data stored in it. Use it only when you intentionally want to discard the local PostgreSQL database. Do not run it against a production Compose environment or a volume containing data you need.
</blockquote>

To reset a file-backed SQLite database, stop the API first and then delete only the local file `apps/api/.local/voice-agent.sqlite`. This permanently removes that SQLite database. Do not delete files in a directory unless you have verified that they are disposable.

## 4. CI verification

The GitHub Actions workflow exercises the same database choices used by contributors:

- The main quality job tests the TypeORM migration, persistence services, ownership checks, constraints, and rollback on in-memory SQLite and an ephemeral PostgreSQL 16 service container.
- A separate `Local PostgreSQL Compose smoke test` starts the repository's actual `compose.yaml`, waits for its healthcheck, verifies `pg_isready`, and stops the service without deleting its volume.

The Compose smoke-test runner is disposable CI infrastructure. It does not connect to Railway or any developer's local database.

## 5. Migration rules

- `synchronize` remains `false`; schema changes are made through versioned TypeORM migrations.
- Run `pnpm --filter @voice-and-text-ai-agent/api build` before `migration:run`.
- `migration:show` lists pending/applied migrations for the currently selected database.
- PostgreSQL integration tests are required in CI; SQLite tests provide a fast local feedback loop.
- Do not use SQLite files as hosted/persistent storage for Vercel Functions. Railway's deployed API uses the managed PostgreSQL service, not this local Compose database.
- Vector extensions and vector search are not required by the current schema. Add them only in a separate, explicitly tested migration when the retrieval design needs them.
