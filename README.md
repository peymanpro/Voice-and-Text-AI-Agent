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
| Persistence | PostgreSQL with TypeORM | Conversations, messages, demo sessions, knowledge documents/chunks, tool runs, and execution events |
| Hosting | Vercel for the web app; a compatible Node.js service for the NestJS API | Deployment boundaries that support the actual streaming and audio-upload requirements |
| Database hosting | Neon as the initial hosted PostgreSQL option | Managed PostgreSQL; extension and deployment compatibility will be verified before use |
| AI integration | Vercel AI SDK and provider adapters where supported by current official documentation | Model streaming and provider integration behind application-owned interfaces |
| Speech | Replaceable STT and TTS adapters | Server-side transcription and speech synthesis, with deterministic mock adapters |
| Quality | TypeScript strict mode, lint/format checks, automated tests, Playwright, GitHub Actions | Reproducible development and CI without mandatory paid APIs |

TypeORM is the planned ORM for the NestJS API. Database schema changes will use versioned TypeORM migrations; production schema synchronization will remain disabled. PostgreSQL vector search may be added only after the selected database host and required extension are verified. A deterministic lexical retrieval path is planned so retrieval does not depend entirely on embeddings or a paid API.

### Target structure

The initial workspace is expected to evolve toward the following organization. The actual layout will be documented and updated as files are implemented.

- **apps/web** — Next.js user interface.
- **apps/api** — NestJS application, TypeORM entities/migrations, agent runtime, and server-only provider adapters.
- Shared packages — only where a concrete shared contract or reusable behavior justifies a separate package.
- Root tooling — pnpm workspace, quality scripts, CI, and contributor documentation.

This is a target structure, not a claim that those directories already exist.

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

At this documentation-bootstrap checkpoint, the repository contains product and contribution documentation; the web app, API, database migrations, and runnable tests have not been implemented yet. The initial workspace/tooling phase is the next engineering milestone. See [CONTRIBUTING.md](CONTRIBUTING.md) for development and pull-request conventions.

## Getting started

Initial repository setup is still in progress, so a working installation command is not published yet. Setup instructions and supported runtime versions will be added once the workspace and root scripts are implemented. Do not assume the application can be started from this initial README alone.

## Roadmap

The detailed phased plan, exact branch names, commit titles, acceptance criteria, test requirements, and instructions for coding agents are maintained in the separate [Voice-and-Text-AI-Agent-Roadmap](https://github.com/peymanpro/Voice-and-Text-AI-Agent-Roadmap) repository. That planning repository is currently maintainer-only; this product README remains the public-facing overview.

## License

A license has not yet been selected. Until a license is added to the product repository, do not assume that this project's source code is licensed for redistribution or reuse.
