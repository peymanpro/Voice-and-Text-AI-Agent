/**
 * Desired Railway resources for Voice and Text AI Agent.
 *
 * Apply with the Railway CLI only after the pnpm workspace, NestJS API scripts,
 * TypeORM migration command, and /health/ready endpoint exist. This file does not
 * authenticate Railway, grant GitHub permissions, or enable dashboard-only
 * controls such as Wait for CI.
 *
 * Deployment source is product main. No watch-path filter is set intentionally:
 * each commit to main should redeploy the API after CI succeeds.
 *
 * No custom CPU, memory, replica, volume-size, or usage caps are set here.
 * Railway subscription quotas still apply.
 */
import { defineRailway, github, postgres, project, service } from "railway/iac";

export default defineRailway(() => {
  const database = postgres("postgres");

  const api = service("api", {
    source: github("peymanpro/Voice-and-Text-AI-Agent", {
      branch: "main",
    }),
    build: "pnpm --filter @voice-and-text-ai-agent/api build",
    preDeploy: "pnpm --filter @voice-and-text-ai-agent/api migration:run",
    start: "pnpm --filter @voice-and-text-ai-agent/api start:prod",
    healthcheck: "/health/ready",
    healthcheckTimeout: 300,
    env: {
      NODE_ENV: "production",
      DATABASE_URL: database.env.DATABASE_URL,
    },
  });

  return project("voice-and-text-ai-agent", {
    resources: [database, api],
  });
});
