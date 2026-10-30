/**
 * Desired Railway resources for Voice and Text AI Agent.
 *
 * This blueprint still targets a dedicated project named voice-and-text-ai-agent.
 * The live service currently shares the existing cheerful-curiosity project, so do not
 * apply this blueprint there without reviewing the plan for project/resource changes.
 * The deploy-time migration command retries briefly to tolerate PostgreSQL cold starts.
 * This file does not
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
    preDeploy: "pnpm --filter @voice-and-text-ai-agent/api migration:run:retry",
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
