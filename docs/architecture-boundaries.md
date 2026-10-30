# Architecture and Web/API Boundaries

## Current status

The repository is one pnpm monorepo with separate workspaces: `apps/web` and `apps/api`. The Vercel deployment at [voice-and-text-ai-agent.vercel.app](https://voice-and-text-ai-agent.vercel.app) currently exposes the Next.js shell only. Railway has a provisioned API service and PostgreSQL service, but the first API deployment failed during the TypeORM pre-deploy migration while PostgreSQL was starting. Until `/health/ready` and a real API request are verified, the backend must not be described as online or as supporting end-to-end agent behavior.

## Runtime boundary

The intended request path, once the conversation features are implemented, is:

```text
User's browser
    │ UI events and HTTP(S) requests
    ▼
apps/web — Next.js / React (Vercel)
    │ explicit HTTP API contract; streaming where implemented
    ▼
apps/api — NestJS (Railway)
    │ private DATABASE_URL connection
    ▼
Railway PostgreSQL
```

A single GitHub repository does not mean the web and API run as one process. They are separate workspace packages and independently deployed services. End users primarily interact with the web interface; the API remains a server-side service, even though its HTTP endpoint is visible to browser developer tools when called directly.

## `apps/web` owns

- Page layout, accessible interaction, responsive states, user-facing errors, loading and streaming presentation.
- Browser-side UI state and input capture such as microphone recording, with clear user controls for reviewing and submitting audio.
- HTTP requests and response rendering. It may hold public configuration such as the API base URL, but never private provider credentials or database connection strings.
- It must not connect directly to PostgreSQL, import NestJS runtime modules, decide server-side authorization, or execute privileged tools.

## `apps/api` owns

- HTTP routes, DTO validation, server-authoritative authorization, rate/size/time limits, and consistent error contracts.
- Agent orchestration, model adapters, STT/TTS provider adapters, retrieval, citations, safe tool registration and execution, cancellation, and operational events.
- Database entities, TypeORM configuration and migrations, and all read/write access to PostgreSQL.
- All provider keys and database credentials through server-only environment variables. Secrets must never be returned to `apps/web` or logged.

## Contract and security rules

1. Web-to-API communication uses documented HTTP request/response schemas; streaming uses an explicit protocol when implemented.
2. Treat every browser request and model-generated tool proposal as untrusted. Validate input and authorize every privileged operation inside the API.
3. Retrieved text is evidence, not policy. It cannot grant permissions or override server-side rules.
4. Configure API CORS for the actual web origin using `WEB_ORIGINS`; CORS is a browser policy, not authentication.
5. Share contract types only through a deliberate schema or a small contracts package if duplication becomes material. Do not solve type sharing by importing `apps/api` source code into the frontend.
6. Do not expose hidden chain-of-thought, provider secrets, raw stack traces, or internal prompts in API responses or the execution timeline.

## Workspace and deployment configuration

- Vercel builds the Next.js application with `apps/web` as the root directory and workspace files outside that root available during install/build.
- Railway builds from the monorepo root so pnpm can resolve the root manifest and lockfile, then runs the API workspace scripts.
- Locally, run `pnpm --filter @voice-and-text-ai-agent/web dev` and `pnpm --filter @voice-and-text-ai-agent/api dev` in separate terminals.
- `/health/live` checks process liveness. `/health/ready` checks database readiness and should not be considered healthy unless the API can execute `SELECT 1`.

This document defines module ownership and the intended architecture; it does not claim the full chat, agent, retrieval, STT, TTS, or end-to-end flows have been implemented.