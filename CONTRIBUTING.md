# Contributing

Thanks for helping improve Voice and Text AI Agent. This project is in early implementation, so prefer small, reviewable changes that can be tested independently.

## Before you start

1. Read the product README and the [implementation roadmap](https://github.com/peymanpro/Voice-and-Text-AI-Agent-Roadmap). The roadmap repository is maintainer-only; if you do not have access, focus on the public repository conventions and describe the intended change in your pull request.
2. Check the open issues and pull requests before starting duplicate work.
3. Do not assume a planned feature or documented target architecture has already been implemented.

## Development conventions

- Use Node.js **22.16.0** (see `.node-version`) and pnpm **10.34.9** (pinned in the root package manifest). Install with `pnpm install`; after the committed lockfile is available, prefer `pnpm install --frozen-lockfile`.
- Keep changes focused; avoid unrelated refactoring and unnecessary dependencies.
- Run the relevant root checks: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. Report commands that have not yet passed rather than treating the existence of scripts as successful validation.
- Use TypeScript strict mode and the existing workspace patterns.
- Use Conventional Commit messages, such as **feat: add conversation persistence**, **test: cover transcription errors**, or **docs: clarify setup**.
- Add or update tests whenever behavior, validation, error handling, data persistence, or security boundaries change.
- Do not introduce a required paid API call into ordinary unit tests or CI. Use the deterministic mock adapters for offline behavior.
- Database schema changes must use versioned TypeORM migrations. Do not use TypeORM schema synchronization as a production migration strategy.
- Keep provider credentials, database credentials, session secrets, private data, and raw user audio out of commits, logs, fixtures, and screenshots.
- Never let model-generated text grant permissions or execute arbitrary tools. Server-side authorization and input validation are required.

## Local databases

See [docs/local-database.md](docs/local-database.md) for the SQLite and Docker Compose PostgreSQL workflows, migration commands, integration-test database isolation, and destructive-reset warnings. Do not run the PostgreSQL migration test against a database containing data you need; it deliberately rolls its schema back.

## Pull requests

A pull request should explain:

- What changed and why.
- How the change was tested, including the actual commands and results.
- Any migration, configuration, provider credential, or deployment implications.
- Known limitations and any part that remains mock-only or unverified.

Keep CI green. Do not claim tests, live provider calls, evaluations, or deployments succeeded unless they were actually run and verified. If a check could not run, state the reason instead of implying it passed.
