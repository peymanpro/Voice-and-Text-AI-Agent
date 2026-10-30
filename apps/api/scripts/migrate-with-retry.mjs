import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const apiDirectory = fileURLToPath(new URL("../", import.meta.url));
const maxAttempts = readPositiveInteger(process.env.MIGRATION_MAX_ATTEMPTS, 20);
const retryDelayMs = readPositiveInteger(
  process.env.MIGRATION_RETRY_DELAY_MS,
  3000,
);

function readPositiveInteger(value, fallback) {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function runMigration() {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const child = spawn(command, ["run", "migration:run"], {
      cwd: apiDirectory,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      finish({
        code: 1,
        stdout,
        stderr: stderr + error.message + "\n",
      });
    });
    child.once("close", (code) => finish({ code: code ?? 1, stdout, stderr }));
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = await runMigration();
  const attemptLabel = attempt + "/" + maxAttempts;
  if (result.code === 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (attempt > 1) {
      console.log("Migration succeeded on attempt " + attemptLabel + ".");
    }
    process.exitCode = 0;
    break;
  }

  if (attempt < maxAttempts) {
    console.warn(
      "Migration attempt " + attemptLabel + " failed; retrying.",
    );
    await delay(retryDelayMs);
    continue;
  }

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  console.error("Database migration failed after " + maxAttempts + " attempts.");
  process.exitCode = result.code;
}
