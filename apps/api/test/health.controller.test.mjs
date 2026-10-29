import assert from "node:assert/strict";
import test from "node:test";
import { HealthController } from "../dist/health/health.controller.js";

test("liveness does not depend on database availability", () => {
  const controller = new HealthController({
    query: async () => {
      throw new Error("database should not be queried for liveness");
    },
  });

  assert.deepEqual(controller.live(), { status: "ok" });
});

test("readiness succeeds when the database responds", async () => {
  const controller = new HealthController({
    query: async () => [{ "?column?": 1 }],
  });

  assert.deepEqual(await controller.ready(), {
    status: "ok",
    database: "ready",
  });
});

test("readiness returns 503 when the database query fails", async () => {
  const controller = new HealthController({
    query: async () => {
      throw new Error("private database detail");
    },
  });

  await assert.rejects(controller.ready(), (error) => {
    assert.equal(error.getStatus(), 503);
    assert.deepEqual(error.getResponse(), {
      status: "error",
      database: "unavailable",
    });
    return true;
  });
});
