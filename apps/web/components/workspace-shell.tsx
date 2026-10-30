"use client";

import Link from "next/link";
import { useReducer } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import {
  initialWorkspaceState,
  workspaceReducer,
} from "@/lib/workspace-state.mjs";

const suggestedPrompts = [
  "What information would I need to verify a support issue?",
  "Show me how evidence and citations will appear.",
  "Explain how a tool should be approved before it runs.",
];

export function WorkspaceShell() {
  const [state, dispatch] = useReducer(
    workspaceReducer,
    initialWorkspaceState,
  );
  const hasDraft = state.draft.trim().length > 0;

  return (
    <main className="workspace-app">
      <aside className="workspace-sidebar" aria-label="Workspace navigation">
        <Link className="brand-lockup" href="/" aria-label="Return to home">
          <span className="brand-symbol" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">Voice / Text</span>
        </Link>

        <div className="sidebar-section">
          <p className="sidebar-label">Workspace</p>
          <button className="sidebar-nav-item is-active" type="button" aria-current="page">
            <span className="nav-glyph" aria-hidden="true">▤</span>
            Conversation
          </button>
          <button
            className="sidebar-nav-item is-disabled"
            type="button"
            disabled
            title="Knowledge browsing is planned for a later phase."
          >
            <span className="nav-glyph" aria-hidden="true">▧</span>
            Knowledge
            <span className="nav-soon">Soon</span>
          </button>
          <button
            className="sidebar-nav-item is-disabled"
            type="button"
            disabled
            title="Tool execution is planned for a later phase."
          >
            <span className="nav-glyph" aria-hidden="true">⌘</span>
            Tool runs
            <span className="nav-soon">Soon</span>
          </button>
        </div>

        <div className="sidebar-divider" />
        <div className="sidebar-empty">
          <span className="sidebar-empty-icon" aria-hidden="true">◌</span>
          <p>No conversations yet</p>
          <span>Your conversations will appear here when the runtime is connected.</span>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-avatar" aria-hidden="true">P</div>
          <div className="sidebar-account">
            <strong>Preview session</strong>
            <span>Local interface state only</span>
          </div>
          <span className="sidebar-more" aria-hidden="true">···</span>
        </div>
      </aside>

      <section className="workspace-main" aria-labelledby="workspace-title">
        <header className="workspace-topbar">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Workspace</span>
          </div>
          <StatusPill tone="warning">Preview mode</StatusPill>
        </header>

        <div className="workspace-heading">
          <div>
            <p className="eyebrow-text">CONVERSATION WORKSPACE</p>
            <h1 id="workspace-title">A clearer way to work through a question.</h1>
            <p className="workspace-intro">
              Compose a draft and explore the interface. Sending, speech, retrieval,
              and agent execution are not connected yet.
            </p>
          </div>
          <div className="workspace-heading-mark" aria-hidden="true">✳</div>
        </div>

        <div className="runtime-notice" role="status">
          <span className="notice-icon" aria-hidden="true">i</span>
          <div>
            <strong>Agent runtime is not connected</strong>
            <p>Your draft stays in this page. No message is sent and no model is called.</p>
          </div>
          <span className="notice-phase">Phase 02</span>
        </div>

        <div className="workspace-panels">
          <section className="conversation-panel" aria-label="Conversation">
            <div className="conversation-panel-top">
              <div>
                <span className="panel-kicker">CURRENT SESSION</span>
                <h2>New conversation</h2>
              </div>
              <span className="session-state">Not started</span>
            </div>

            <div className="transcript-empty">
              <div className="empty-orbit" aria-hidden="true">
                <span className="orbit-core">✳</span>
                <span className="orbit-dot orbit-dot-one" />
                <span className="orbit-dot orbit-dot-two" />
              </div>
              <h3>Your conversation starts here.</h3>
              <p>
                When the agent is implemented, messages, retrieved evidence, and
                execution events will be presented in this space.
              </p>
              <div className="empty-divider">
                <span />
                <small>TRY A DRAFT</small>
                <span />
              </div>
              <div className="suggested-prompts">
                {suggestedPrompts.map((prompt) => (
                  <button
                    className="suggestion-button"
                    key={prompt}
                    onClick={() => dispatch({ type: "set-draft", value: prompt })}
                    type="button"
                  >
                    <span aria-hidden="true">↗</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="composer">
              <label className="composer-label" htmlFor="message-draft">
                Your message
              </label>
              <textarea
                id="message-draft"
                aria-describedby="composer-help"
                maxLength={2000}
                onChange={(event) =>
                  dispatch({ type: "set-draft", value: event.target.value })
                }
                placeholder="Write a question or choose one of the suggestions above…"
                rows={3}
                value={state.draft}
              />
              <div className="composer-footer">
                <div className="composer-tools">
                  <button
                    aria-label="Voice input is not available yet"
                    className="icon-action"
                    disabled
                    title="Speech input is planned for a later phase."
                    type="button"
                  >
                    <span aria-hidden="true">◉</span>
                  </button>
                  {hasDraft ? (
                    <Button
                      onClick={() => dispatch({ type: "clear-draft" })}
                      size="sm"
                      variant="ghost"
                    >
                      Clear draft
                    </Button>
                  ) : (
                    <span id="composer-help" className="composer-hint">
                      Text stays local in preview mode.
                    </span>
                  )}
                </div>
                <div className="composer-submit">
                  <span className="character-count">{state.draft.length}/2000</span>
                  <Button disabled size="md" variant="primary" title="The agent API is not connected yet.">
                    Send
                    <span aria-hidden="true">↗</span>
                  </Button>
                </div>
              </div>
              {hasDraft ? (
                <p className="draft-status" aria-live="polite">
                  Draft saved in this page only. Sending is disabled until the API conversation flow is implemented.
                </p>
              ) : null}
            </div>
          </section>

          <aside className="inspector-panel" aria-label="Conversation inspector">
            <div className="inspector-heading">
              <div>
                <span className="panel-kicker">TRANSPARENCY</span>
                <h2>Inspector</h2>
              </div>
              <span className="inspector-count">0</span>
            </div>

            <div className="inspector-tabs" role="tablist" aria-label="Inspector panels">
              <button
                aria-controls="inspector-content"
                aria-selected={state.inspector === "evidence"}
                className={state.inspector === "evidence" ? "inspector-tab is-selected" : "inspector-tab"}
                id="evidence-tab"
                onClick={() => dispatch({ type: "select-inspector", value: "evidence" })}
                role="tab"
                type="button"
              >
                Evidence
              </button>
              <button
                aria-controls="inspector-content"
                aria-selected={state.inspector === "activity"}
                className={state.inspector === "activity" ? "inspector-tab is-selected" : "inspector-tab"}
                id="activity-tab"
                onClick={() => dispatch({ type: "select-inspector", value: "activity" })}
                role="tab"
                type="button"
              >
                Activity
              </button>
            </div>

            <div
              aria-labelledby={state.inspector === "evidence" ? "evidence-tab" : "activity-tab"}
              className="inspector-content"
              id="inspector-content"
              role="tabpanel"
              tabIndex={0}
            >
              {state.inspector === "evidence" ? (
                <div className="inspector-empty">
                  <span className="inspector-empty-icon" aria-hidden="true">◇</span>
                  <h3>No evidence yet</h3>
                  <p>
                    Source excerpts and citations will appear here after a real
                    retrieval request has completed.
                  </p>
                  <span className="inspector-footnote">RETRIEVAL NOT CONNECTED</span>
                </div>
              ) : (
                <div className="inspector-empty">
                  <span className="inspector-empty-icon" aria-hidden="true">⌁</span>
                  <h3>No activity yet</h3>
                  <p>
                    Operational events will be listed here when the agent runtime
                    begins processing a conversation.
                  </p>
                  <span className="inspector-footnote">NO TOOLS HAVE RUN</span>
                </div>
              )}
            </div>

            <div className="inspector-privacy">
              <span aria-hidden="true">⌑</span>
              <p>Operational transparency, not hidden chain-of-thought.</p>
            </div>
          </aside>
        </div>

        <footer className="workspace-footer">
          <span>Voice and Text AI Agent</span>
          <span>UI preview · No provider connection</span>
        </footer>
      </section>
    </main>
  );
}
