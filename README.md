# Voice and Text AI Agent

A portfolio-grade voice-and-text assistant designed to make agent behavior understandable: conversations, retrieved evidence, bounded tool execution, and speech input/output in one coherent product experience.

> **Project status: initial implementation phase.** This repository is being built. The features and architecture described as planned below are targets, not claims of shipped functionality. No production demo URL is available yet.

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

| Layer | Planned technology | Responsibility |
|---|---|---|
| Web | Next.js App Router, React, TypeScript, Tailwind CSS | Product UI, conversation workspace, evidence inspector, accessible voice controls |
| API | NestJS, Node.js, TypeScript | Validated API contracts, agent orchestration, provider adapters, tools, security boundaries |
| Persistence | Hosted PostgreSQL with TypeORM for deployment; SQLite via TypeORM/better-sqlite3 for local development and fast tests | Conversations, messages, demo sessions, knowledge documents/chunks, tool runs, and execution events |
| Hosting | Vercel for the Next.js web app; Railway for the NestJS API and Railway PostgreSQL in one project | Planned auto-deploy from product main after CI; Railway account connection and first deployment are not yet active |
| Database hosting | Railway PostgreSQL as the intended API database; Neon/Supabase are optional PostgreSQL fallbacks | Managed PostgreSQL, private service networking, and Railway-managed DATABASE_URL reference; verify the current subscription quotas before deployment |
| AI integration | Vercel AI SDK and provider adapters where supported by current official documentation | Model streaming and provider integration behind application-owned interfaces |
| Speech | Replaceable STT and TTS adapters | Server-side transcription and speech synthesis, with deterministic mock adapters |
| Quality | TypeScript strict mode, lint/format checks, automated tests, Playwright, GitHub Actions | Reproducible development and CI without mandatory paid APIs |

TypeORM is the planned ORM for the NestJS API. Database schema changes will use versioned TypeORM migrations; production schema synchronization will remain disabled. The intended online deployment is a Railway NestJS service connected privately to a Railway PostgreSQL service through a service-referenced `DATABASE_URL`. Neon and Supabase remain optional PostgreSQL fallbacks. SQLite through TypeORM's `better-sqlite3` driver is planned for quick local development and tests, while PostgreSQL integration tests remain mandatory before release. A local SQLite file must never be used as persistent storage for a deployed Vercel Function, whose writable `/tmp` space is temporary. Turso/libSQL is a possible future hosted SQLite option, but it must not be selected until a suitable TypeORM driver and its migration/transaction behavior have been verified. PostgreSQL vector search may be added only after the selected database host and required extension are verified. A deterministic lexical retrieval path is planned so retrieval does not depend entirely on embeddings or a paid API.

### Target structure

The initial workspace is expected to evolve toward the following organization. The actual layout will be documented and updated as files are implemented.

- **apps/web** — Next.js user interface.
- **apps/api** — NestJS application, TypeORM entities/migrations, agent runtime, and server-only provider adapters.
- Shared packages — only where a concrete shared contract or reusable behavior justifies a separate package.
- Root tooling — pnpm workspace, quality scripts, CI, and contributor documentation.
- **.railway/railway.ts** — Railway Infrastructure as Code blueprint declaring a Railway PostgreSQL resource and API service, intended to deploy from product `main`.

The Railway blueprint has not been applied to a Railway account. The API workspace, build/start/migration scripts, and readiness endpoint still need to be implemented before the first deployment can succeed.

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

The initial pnpm workspace scaffold now contains a Next.js web shell, a NestJS API shell, TypeORM configuration, local SQLite/PostgreSQL driver selection, liveness/readiness endpoints, quality scripts, and a GitHub Actions workflow. The complete agent, model/STT/TTS adapters, knowledge retrieval, domain migrations, and end-to-end flows are still pending. The Railway Infrastructure as Code blueprint exists, but it has not been applied to a Railway account and no live deployment is claimed. See [CONTRIBUTING.md](CONTRIBUTING.md) for the supported toolchain and development commands.

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

Root quality commands are `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. The first lockfile is being bootstrapped by CI; after `pnpm-lock.yaml` is committed, use `pnpm install --frozen-lockfile` for reproducible installs. These commands do not imply that the complete agent or voice workflows are already implemented.

## Roadmap

The detailed phased plan, exact branch names, commit titles, acceptance criteria, test requirements, and instructions for coding agents are maintained in the separate [Voice-and-Text-AI-Agent-Roadmap](https://github.com/peymanpro/Voice-and-Text-AI-Agent-Roadmap) repository. That planning repository is currently maintainer-only; this product README remains the public-facing overview.

## License

A license has not yet been selected. Until a license is added to the product repository, do not assume that this project's source code is licensed for redistribution or reuse.
