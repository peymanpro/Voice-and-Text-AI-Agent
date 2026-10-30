import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  initialWorkspaceState,
  workspaceReducer,
} from "../lib/workspace-state.mjs";
import { WorkspaceShell } from "../components/workspace-shell.tsx";

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

test("clears the draft while preserving the selected inspector", () => {
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

test("renders the empty conversation and honest preview state", () => {
  const html = renderToStaticMarkup(createElement(WorkspaceShell));

  assert.match(html, /Your conversation starts here\./);
  assert.match(html, /Agent runtime is not connected/);
  assert.match(html, /No message is sent and no model is called\./);
  assert.match(html, /No evidence yet/);
  assert.match(html, /No activity yet/);
});

test("keeps unavailable send and voice controls disabled and labelled", () => {
  const html = renderToStaticMarkup(createElement(WorkspaceShell));

  assert.match(html, /aria-label="Voice input is not available yet"/);
  assert.match(html, /Send[\s\S]*?<\/button>/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-describedby="composer-help"/);
  assert.match(html, /Your message/);
});

test("renders accessible inspector controls and prompt suggestions", () => {
  const html = renderToStaticMarkup(createElement(WorkspaceShell));

  assert.match(html, /role="group" aria-label="Inspector panels"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /Evidence/);
  assert.match(html, /Activity/);
  assert.match(html, /Show me how evidence and citations will appear\./);
});
