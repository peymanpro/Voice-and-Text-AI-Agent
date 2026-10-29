import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DataSourceOptions } from "typeorm";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export function createTypeOrmOptions(): DataSourceOptions {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const commonOptions = {
    entities: [],
    migrations: [join(currentDirectory, "migrations", "*{.js,.ts}")],
    migrationsRun: false,
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
    logging: false,
  } as const;

  if (databaseUrl) {
    return {
      ...commonOptions,
      type: "postgres",
      url: databaseUrl,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return {
    ...commonOptions,
    type: "better-sqlite3",
    database: process.env.SQLITE_DATABASE?.trim() || ":memory:",
  };
}
