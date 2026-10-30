import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { initialWorkspaceState, workspaceReducer } from "../lib/workspace-state.mjs";
import { WorkspaceShell } from "../components/workspace-shell.tsx";
import { Card } from "../components/ui/card.tsx";
import { Dialog } from "../components/ui/dialog.tsx";
import { Skeleton } from "../components/ui/skeleton.tsx";
import { TextField } from "../components/ui/text-field.tsx";

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
  assert.doesNotMatch(html, /No activity yet/);
});

test("renders the activity empty state when the activity panel is selected", () => {
  const html = renderToStaticMarkup(
    createElement(WorkspaceShell, { initialInspector: "activity" }),
  );

  assert.match(html, /No activity yet/);
  assert.match(html, /NO TOOLS HAVE RUN/);
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

test("renders a labelled text field with its hint", () => {
  const html = renderToStaticMarkup(
    createElement(TextField, {
      id: "email",
      label: "Email address",
      hint: "Used only for account notifications.",
      placeholder: "name@example.com",
    }),
  );

  assert.match(html, /for="email"/);
  assert.match(html, /id="email"/);
  assert.match(html, /aria-describedby="email-hint"/);
  assert.match(html, /Email address/);
  assert.match(html, /Used only for account notifications/);
});

test("renders validation errors accessibly on a text field", () => {
  const html = renderToStaticMarkup(
    createElement(TextField, {
      id: "email",
      label: "Email address",
      error: "Enter a valid email address.",
    }),
  );

  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="email-error"/);
  assert.match(html, /Enter a valid email address/);
});

test("renders a reusable card with its selected spacing", () => {
  const html = renderToStaticMarkup(
    createElement(Card, { padding: "lg" }, "Reusable content"),
  );

  assert.match(html, /class="ui-card ui-card-lg"/);
  assert.match(html, /Reusable content/);
});

test("renders loading skeletons as decorative content", () => {
  const html = renderToStaticMarkup(
    createElement(Skeleton, {
      shape: "circular",
      width: "40px",
      height: "40px",
    }),
  );

  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /ui-skeleton-circular/);
  assert.match(html, /width:40px/);
  assert.match(html, /height:40px/);
});

test("renders a dialog with an accessible title and close action", () => {
  const html = renderToStaticMarkup(
    createElement(
      Dialog,
      { open: false, title: "Confirm action", onOpenChange: () => {} },
      "Dialog content",
    ),
  );

  assert.match(html, /<dialog/);
  assert.match(html, /aria-labelledby=/);
  assert.match(html, /Confirm action/);
  assert.match(html, /aria-label="Close dialog"/);
  assert.match(html, /Dialog content/);
});
