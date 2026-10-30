# Voice and Text AI Agent

A portfolio-grade voice-and-text assistant designed to make agent behavior understandable: conversations, retrieved evidence, bounded tool execution, and speech input/output in one coherent product experience.

> **Project status: early implementation phase.** The Next.js web shell is deployed at [voice-and-text-ai-agent.vercel.app](https://voice-and-text-ai-agent.vercel.app), and the NestJS API shell is deployed at [voice-and-text-ai-agent-api-production.up.railway.app](https://voice-and-text-ai-agent-api-production.up.railway.app). Railway reports a successful deployment with `/health/ready` configured as its readiness check, and the API's `WEB_ORIGINS` is configured for the Vercel origin. This is only the application/health shell—not a working AI agent. Chat, agent orchestration, retrieval, STT/TTS, and end-to-end behavior remain unimplemented.

## Why this project exists

A useful AI agent is more than a chat window connected to a language model. It needs controlled execution, trustworthy inputs and outputs, evidence that can be inspected, graceful failures, persistence, reproducible tests, and a user interface that communicates what is actually happening.

Voice and Text AI Agent is intended to demonstrate those engineering concerns in a single end-to-end application. The initial scenario is a fictional support assistant over a small, versioned knowledge base. It will let users interact through text or recorded speech, inspect supporting sources, and see when a demo tool was proposed and whether it actually completed.

## Planned experience

The following capabilities are **planned** and should be treated as incomplete until their implementation and tests are verified:

- **Text conversations:** incremental responses, conversation history, cancellation, retry, and clear error states.
- **Voice input:** accessible microphone recording, Speech-to-Text (STT), transcript review/editing, and an explicit send step.
- **Voice output:** optional Text-to-Speech (TTS) for assistant responses, with playback controls and graceful provider failures.
- **Evidence inspector:** retrieved knowledge excerpts and stable citations tied to the stored source chunks.
- **Execution timeline:** operational events such as retrieval and tool execution, without exposing hidden chain-of-thought or secrets.
- **Bounded agent runtime:** typed, allowlisted tools, server-side authorization, limits on turns and tool calls, and cancellation/timeouts.
- **Safe demo tools:** a seeded service-status lookup and a simulated support ticket. These will not call real external business systems.
- **Reproducible evaluation:** a versioned fictional test set and an offline evaluation path that does not require paid model or speech APIs.
- **Responsive product UI:** considered empty, loading, streaming, error, keyboard, mobile, and reduced-motion states rather than only the happy path.

The default development and CI path is intended to work with deterministic mock providers. Real model/STT/TTS providers will be optional, configured through server-only environment variables.

## Planned architecture

This repository is intended to be a **pnpm monorepo** with separate web and API workspaces:

| Layer            | Planned technology                                                                                                    | Responsibility                                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web              | Next.js App Router, React, TypeScript, Tailwind CSS                                                                   | Product UI, conversation workspace, evidence inspector, accessible voice controls                                                                                               |
| API              | NestJS, Node.js, TypeScript                                                                                           | Validated API contracts, agent orchestration, provider adapters, tools, security boundaries                                                                                     |
| Persistence      | Hosted PostgreSQL with TypeORM for deployment; SQLite via TypeORM/better-sqlite3 for local development and fast tests | Conversations, messages, demo sessions, knowledge documents/chunks, tool runs, and execution events                                                                             |
| Hosting          | Vercel for the Next.js web app; Railway for the NestJS API and PostgreSQL                                             | The web shell and API shell are deployed; Railway reports success for the API deployment with `/health/ready` configured as its readiness check. Agent features remain planned. |
| Database hosting | Railway PostgreSQL as the intended API database; Neon/Supabase are optional PostgreSQL fallbacks                      | Managed PostgreSQL, private service networking, and Railway-managed DATABASE_URL reference; verify the current subscription quotas before deployment                            |
| AI integration   | Vercel AI SDK and provider adapters where supported by current official documentation                                 | Model streaming and provider integration behind application-owned interfaces                                                                                                    |
| Speech           | Replaceable STT and TTS adapters                                                                                      | Server-side transcription and speech synthesis, with deterministic mock adapters                                                                                                |
| Quality          | TypeScript strict mode, lint/format checks, automated tests, Playwright, GitHub Actions                               | Reproducible development and CI without mandatory paid APIs                                                                                                                     |

TypeORM is the planned ORM for the NestJS API. Database schema changes will use versioned TypeORM migrations; production schema synchronization will remain disabled. The current online deployment uses a Railway NestJS service connected privately to Railway PostgreSQL through a service-referenced `DATABASE_URL`. Neon and Supabase remain optional PostgreSQL fallbacks. SQLite through TypeORM's `better-sqlite3` driver is planned for quick local development and tests, while PostgreSQL integration tests remain mandatory before release. A local SQLite file must never be used as persistent storage for a deployed Vercel Function, whose writable `/tmp` space is temporary. Turso/libSQL is a possible future hosted SQLite option, but it must not be selected until a suitable TypeORM driver and its migration/transaction behavior have been verified. PostgreSQL vector search may be added only after the selected database host and required extension are verified. A deterministic lexical retrieval path is planned so retrieval does not depend entirely on embeddings or a paid API.

### Workspace structure and the web/API boundary

This is the repository's current workspace split. The two applications are separate pnpm workspaces and are intended to run and deploy as separate services.

The following boundaries describe the current monorepo structure and the intended runtime split; they do not imply that the full agent flow is already implemented.

- **`apps/web` — presentation/client boundary:** Next.js App Router, React, user interaction, UI state, accessible browser audio capture, and HTTP calls to the API. It must not connect directly to PostgreSQL or contain provider/database secrets.
- **`apps/api` — server/domain boundary:** NestJS HTTP endpoints, request validation, authorization, agent orchestration, server-side model/STT/TTS adapters, bounded tool execution, retrieval, persistence, and TypeORM migrations. Only this service accesses the database and secret provider credentials.
- **HTTP contract:** the web app and API communicate through explicit HTTP request/response contracts (and streaming when implemented). Do not import NestJS runtime modules into the web app. Add a shared contracts package only when there is a concrete schema/type reuse need.
- **Root tooling:** pnpm workspace, lockfile, shared quality scripts, GitHub Actions CI, and contributor documentation.
- **`.railway/railway.ts`:** a desired-state blueprint that currently names a dedicated Railway project. It has not been applied to the existing `cheerful-curiosity` project and must not be applied there without reviewing the plan.

The `.railway/railway.ts` blueprint has not been applied to the currently used Railway project: it describes a dedicated project, while the live API and database reside in `cheerful-curiosity`. The API workspace, build/start/migration scripts, and readiness endpoint exist. The current Railway deployment reports `SUCCESS` with `/health/ready` configured as the readiness check; direct public request verification should still be included in the future end-to-end smoke test.

## Safety and trust boundaries

The initial demo is intentionally bounded:

- Model-generated tool proposals are untrusted input. Only server-registered tools with validated arguments and explicit authorization may execute.
- Retrieved documents are untrusted reference material; their contents cannot grant permissions or override server-side policy.
- Tool calls, agent turns, elapsed time, payload sizes, and retrieval result counts will have explicit limits.
- Demo tools operate only on seeded/demo data. No real ticketing, communications, payments, or destructive actions are in scope for the initial release.
- Raw microphone recordings will not be retained by default. The UI and documentation must make transcript persistence behavior clear.
- API keys and database credentials must remain server-side and must never be committed, logged, embedded in the browser bundle, or placed in screenshots.
- Execution timelines will show operational events and evidence, not hidden chain-of-thought or private prompts.

## Development status

At the initial bootstrap stage, this repository does **not** yet represent a working voice agent. The implementation will be delivered through small, tested phases:

1. Workspace and quality-tooling foundation.
2. Responsive product shell and design primitives.
3. PostgreSQL persistence with TypeORM migrations.
4. Replaceable model adapters and deterministic offline mocks.
5. Streaming text chat and conversation history.
6. Bounded agent runtime and typed tool registry.
7. Retrieval, evidence citations, and safe demo tools.
8. STT input and TTS playback.
9. Context bounds, evaluation, security, accessibility, and E2E coverage.
10. Verified deployment and final documentation.

Completed status will be based on passing tests and verified behavior, not the existence of a checkbox or a design mockup.

## Quality principles

- Default unit, integration, and CI tests should be deterministic and offline.
- Live provider calls are opt-in and must not be required for a normal test run.
- A task is complete only after its implementation, relevant tests, and documentation agree.
- Failures, cancellation, unsupported audio formats, and missing configuration are first-class states.
- Keep abstractions small and justified. Do not add multi-agent orchestration or services merely for visual complexity.
- Do not publish benchmark numbers, provider capabilities, screenshots, or deployment URLs without reproducible evidence.
- Prefer focused changes and Conventional Commit messages.

## Current repository state

The pnpm workspace contains a Next.js web shell, a NestJS API shell, TypeORM configuration, local SQLite/PostgreSQL driver selection, `/health/live` and `/health/ready` endpoints, quality scripts, and a GitHub Actions workflow. The complete agent runtime, model/STT/TTS adapters, knowledge retrieval, domain entities/migrations, and end-to-end flows remain pending. The web shell is deployed at [https://voice-and-text-ai-agent.vercel.app](https://voice-and-text-ai-agent.vercel.app). The API shell is deployed at [https://voice-and-text-ai-agent-api-production.up.railway.app](https://voice-and-text-ai-agent-api-production.up.railway.app) in the existing `cheerful-curiosity` Railway project; the latest deployment reports `SUCCESS`, and Railway is configured to use `/health/ready` as its readiness check. A first attempt failed when PostgreSQL was cold-starting; the bounded migration-retry command then succeeded, and a subsequent deployment with `WEB_ORIGINS=https://voice-and-text-ai-agent.vercel.app` also succeeded. The pre-existing `nestjs-graphql-filter-pagination` service was not modified. The dedicated-project `.railway/railway.ts` blueprint has not been applied because it targets a different project. The public API currently exposes only the health endpoints; the web shell does not yet call a implemented chat/agent API. See [docs/architecture-boundaries.md](docs/architecture-boundaries.md) for the web/API security boundary, and [CONTRIBUTING.md](CONTRIBUTING.md) for development commands.

## Getting started

### Requirements

- Node.js 22.16.0 (see `.node-version`).
- pnpm 10.34.9 (pinned in the root `package.json`).

### Local setup

```bash
pnpm install
pnpm --filter @voice-and-text-ai-agent/web dev
pnpm --filter @voice-and-text-ai-agent/api dev
```

The web and API development commands run in separate terminals. In local development, the API uses an in-memory SQLite database when `DATABASE_URL` is not set. Set `DATABASE_URL` to a PostgreSQL connection string to exercise PostgreSQL locally. Production requires `DATABASE_URL`; it must never use local SQLite storage.

Root quality commands are `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. The committed `pnpm-lock.yaml` should be used with `pnpm install --frozen-lockfile` for reproducible installs. These commands do not imply that the complete agent or voice workflows are already implemented.

## Roadmap

The detailed phased plan, exact branch names, commit titles, acceptance criteria, test requirements, and instructions for coding agents are maintained in the separate [Voice-and-Text-AI-Agent-Roadmap](https://github.com/peymanpro/Voice-and-Text-AI-Agent-Roadmap) repository. That planning repository is currently maintainer-only; this product README remains the public-facing overview.

## License

A license has not yet been selected. Until a license is added to the product repository, do not assume that this project's source code is licensed for redistribution or reuse.
