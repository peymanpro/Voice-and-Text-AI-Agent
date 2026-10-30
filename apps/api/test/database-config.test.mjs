import assert from "node:assert/strict";
import test from "node:test";

import { createTypeOrmOptions } from "../dist/database/typeorm-options.js";

const environmentKeys = [
  "NODE_ENV",
  "DATABASE_URL",
  "SQLITE_DATABASE",
  "VERCEL",
  "RAILWAY_ENVIRONMENT",
];

function withEnvironment(values, callback) {
  const original = Object.fromEntries(
    environmentKeys.map((key) => [key, process.env[key]]),
  );

  for (const key of environmentKeys) {
    delete process.env[key];
  }

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }

  try {
    return callback();
  } finally {
    for (const key of environmentKeys) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

test("uses in-memory SQLite by default in local development", () => {
  withEnvironment({ NODE_ENV: "development" }, () => {
    const options = createTypeOrmOptions();

    assert.equal(options.type, "better-sqlite3");
    assert.equal(options.database, ":memory:");
    assert.equal(options.synchronize, false);
    assert.equal(options.migrationsRun, false);
    assert.equal(options.migrationsTableName, "typeorm_migrations");
    assert.equal(options.entities.length, 3);
  });
});

test("uses an explicit local SQLite database path when configured", () => {
  withEnvironment(
    { NODE_ENV: "test", SQLITE_DATABASE: "./.local/voice-agent.sqlite" },
    () => {
      const options = createTypeOrmOptions();

      assert.equal(options.type, "better-sqlite3");
      assert.equal(options.database, "./.local/voice-agent.sqlite");
    },
  );
});

test("selects PostgreSQL for a valid PostgreSQL URL", () => {
  const databaseUrl = "postgresql://db.example.test:5432/voice_agent";

  withEnvironment({ NODE_ENV: "production", DATABASE_URL: databaseUrl }, () => {
    const options = createTypeOrmOptions();

    assert.equal(options.type, "postgres");
    assert.equal(options.url, databaseUrl);
    assert.equal(options.synchronize, false);
    assert.equal(options.migrationsRun, false);
  });
});

test("rejects an invalid database URL without echoing its value", () => {
  const invalidUrl = "postgresql://db.example.test:invalid-port/voice_agent";

  withEnvironment({ NODE_ENV: "production", DATABASE_URL: invalidUrl }, () => {
    assert.throws(
      () => createTypeOrmOptions(),
      (error) => {
        assert.match(error.message, /valid PostgreSQL connection URL/);
        assert.doesNotMatch(error.message, /invalid-port/);
        return true;
      },
    );
  });
});

test("rejects non-PostgreSQL URLs", () => {
  withEnvironment(
    {
      NODE_ENV: "development",
      DATABASE_URL: "mysql://localhost/voice_agent",
    },
    () => {
      assert.throws(createTypeOrmOptions, /postgres or postgresql protocol/);
    },
  );
});

test("rejects a PostgreSQL URL without a database name", () => {
  withEnvironment(
    { NODE_ENV: "production", DATABASE_URL: "postgresql://localhost" },
    () => {
      assert.throws(createTypeOrmOptions, /host and database name/);
    },
  );
});

test("requires PostgreSQL in production", () => {
  withEnvironment({ NODE_ENV: "production" }, () => {
    assert.throws(
      createTypeOrmOptions,
      /DATABASE_URL is required in hosted environments/,
    );
  });
});

test("rejects local SQLite in a Vercel runtime", () => {
  withEnvironment({ NODE_ENV: "development", VERCEL: "1" }, () => {
    assert.throws(createTypeOrmOptions, /SQLite is local-only/);
  });
});

test("rejects local SQLite in a Railway runtime", () => {
  withEnvironment(
    { NODE_ENV: "development", RAILWAY_ENVIRONMENT: "production" },
    () => {
      assert.throws(createTypeOrmOptions, /SQLite is local-only/);
    },
  );
});

test("rejects ambiguous PostgreSQL and SQLite settings", () => {
  withEnvironment(
    {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost/voice_agent",
      SQLITE_DATABASE: "./local.sqlite",
    },
    () => {
      assert.throws(
        createTypeOrmOptions,
        /Set either DATABASE_URL or SQLITE_DATABASE/,
      );
    },
  );
});
