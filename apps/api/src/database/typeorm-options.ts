import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DataSourceOptions } from "typeorm";

import { persistenceEntities } from "./entities/index.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

function isHostedRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    Boolean(process.env.RAILWAY_ENVIRONMENT)
  );
}

function validatePostgresUrl(databaseUrl: string): void {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (
    parsedUrl.protocol !== "postgres:" &&
    parsedUrl.protocol !== "postgresql:"
  ) {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
  }

  if (!parsedUrl.hostname || parsedUrl.pathname.length < 2) {
    throw new Error("DATABASE_URL must include a host and database name.");
  }
}

export function createTypeOrmOptions(): DataSourceOptions {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const sqliteDatabase = process.env.SQLITE_DATABASE?.trim();
  const hostedRuntime = isHostedRuntime();

  if (databaseUrl && sqliteDatabase) {
    throw new Error(
      "Set either DATABASE_URL or SQLITE_DATABASE, not both.",
    );
  }

  const commonOptions = {
    entities: [...persistenceEntities],
    migrations: [join(currentDirectory, "migrations", "*{.js,.ts}")],
    migrationsRun: false,
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
    logging: false,
  };

  if (databaseUrl) {
    validatePostgresUrl(databaseUrl);

    return {
      ...commonOptions,
      type: "postgres",
      url: databaseUrl,
    };
  }

  if (hostedRuntime) {
    throw new Error(
      "DATABASE_URL is required in hosted environments. SQLite is local-only.",
    );
  }

  return {
    ...commonOptions,
    type: "better-sqlite3",
    database: sqliteDatabase || ":memory:",
  };
}
