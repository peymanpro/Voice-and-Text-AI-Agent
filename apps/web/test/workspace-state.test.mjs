import assert from "node:assert/strict";
import test from "node:test";

import {
  initialWorkspaceState,
  workspaceReducer,
} from "../lib/workspace-state.mjs";

test("starts with an empty draft and evidence inspector", () => {
  assert.deepEqual(initialWorkspaceState, {
    draft: "",
    inspector: "evidence",
  });
});

test("stores composer text without changing the selected inspector", () => {
  const state = workspaceReducer(initialWorkspaceState, {
    type: "set-draft",
    value: "Summarize the available evidence.",
  });

  assert.equal(state.draft, "Summarize the available evidence.");
  assert.equal(state.inspector, "evidence");
});

test("clears the draft while preserving the inspector tab", () => {
  const activityState = workspaceReducer(initialWorkspaceState, {
    type: "select-inspector",
    value: "activity",
  });
  const withDraft = workspaceReducer(activityState, {
    type: "set-draft",
    value: "A question in progress",
  });
  const cleared = workspaceReducer(withDraft, { type: "clear-draft" });

  assert.equal(cleared.draft, "");
  assert.equal(cleared.inspector, "activity");
});

test("switches between evidence and activity panels", () => {
  const activityState = workspaceReducer(initialWorkspaceState, {
    type: "select-inspector",
    value: "activity",
  });
  const evidenceState = workspaceReducer(activityState, {
    type: "select-inspector",
    value: "evidence",
  });

  assert.equal(activityState.inspector, "activity");
  assert.equal(evidenceState.inspector, "evidence");
});

test("ignores an unsupported inspector value", () => {
  const state = workspaceReducer(initialWorkspaceState, {
    type: "select-inspector",
    value: "secrets",
  });

  assert.equal(state, initialWorkspaceState);
});
