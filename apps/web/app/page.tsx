import Link from "next/link";

import { StatusPill } from "@/components/ui/status-pill";

const capabilities = [
  {
    index: "01",
    title: "A conversation with context",
    description:
      "Text and voice belong in one workspace, with a clear distinction between what was asked, what was retrieved, and what happened next.",
    state: "Planned",
  },
  {
    index: "02",
    title: "Evidence in the open",
    description:
      "Source excerpts and citations should be inspectable, not hidden behind an answer that simply sounds convincing.",
    state: "Planned",
  },
  {
    index: "03",
    title: "Tools with boundaries",
    description:
      "Model proposals are not permissions. Server-side validation, authorization, and execution limits govern every tool.",
    state: "Planned",
  },
];

const principles = [
  "A model response is not proof.",
  "Retrieved text is evidence, not policy.",
  "A proposed tool call is not an executed action.",
];

export default function Home() {
  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <Link className="brand-lockup" href="/" aria-label="Voice and Text AI Agent home">
          <span className="brand-symbol" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">VOICE / TEXT</span>
        </Link>
        <nav className="marketing-nav" aria-label="Main navigation">
          <a href="#approach">Approach</a>
          <a href="#principles">Principles</a>
          <Link href="/workspace">Workspace</Link>
        </nav>
        <Link className="button button-secondary button-sm header-cta" href="/workspace">
          Open workspace <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="marketing-hero" aria-labelledby="hero-title">
        <div className="hero-copy-column">
          <div className="hero-kicker">
            <span className="kicker-line" />
            <span>VOICE AND TEXT AI AGENT</span>
            <StatusPill tone="warning">In development</StatusPill>
          </div>
          <h1 id="hero-title">
            From a question
            <br />
            to a <span className="hero-highlight">verifiable</span>
            <br />
            outcome.
          </h1>
          <p className="marketing-lead">
            An engineering-focused agent experience built around evidence,
            bounded actions, and operational clarity—not just a chat box with a
            model behind it.
          </p>
          <div className="hero-cta-row">
            <Link className="button button-primary button-lg" href="/workspace">
              Explore the workspace <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="text-link"
              href="https://github.com/peymanpro/Voice-and-Text-AI-Agent"
              rel="noreferrer"
              target="_blank"
            >
              View source <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="hero-disclaimer">
            Preview only. Conversation processing, model calls, retrieval, and
            speech are not connected yet.
          </p>
        </div>

        <div className="hero-visual" role="img" aria-label="Illustration of the proposed agent workflow. This is not a live system.">
          <div className="visual-orbit orbit-large" />
          <div className="visual-orbit orbit-small" />
          <div className="visual-center">
            <span className="visual-center-mark" aria-hidden="true">✳</span>
            <strong>AGENT</strong>
            <span>CONTROLLED RUNTIME</span>
          </div>
          <div className="visual-node node-input">
            <span className="visual-node-icon" aria-hidden="true">⌘</span>
            <span><strong>Input</strong><small>Text / voice</small></span>
          </div>
          <div className="visual-node node-evidence">
            <span className="visual-node-icon" aria-hidden="true">◇</span>
            <span><strong>Evidence</strong><small>Sources</small></span>
          </div>
          <div className="visual-node node-tools">
            <span className="visual-node-icon" aria-hidden="true">↗</span>
            <span><strong>Tools</strong><small>Allowlisted</small></span>
          </div>
          <div className="visual-node node-result">
            <span className="visual-node-icon" aria-hidden="true">✓</span>
            <span><strong>Outcome</strong><small>Observable</small></span>
          </div>
          <div className="visual-caption">
            <span className="caption-dot" />
            PROPOSED SYSTEM FLOW · NOT LIVE
          </div>
        </div>
      </section>

      <section className="capabilities-section" id="approach">
        <div className="section-header">
          <div>
            <p className="section-kicker">THE PRODUCT APPROACH</p>
            <h2>Useful answers need more than fluency.</h2>
          </div>
          <p>
            The interface is being built to make the boundaries of an agent
            visible—from evidence to execution.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article className="capability-card" key={item.index}>
              <div className="capability-topline">
                <span>{item.index}</span>
                <span className="capability-state">{item.state}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="principles-section" id="principles">
        <div className="principles-heading">
          <p className="section-kicker">TRUST BOUNDARIES</p>
          <h2>Clarity is part of the product.</h2>
          <p>
            The browser owns presentation. The API owns validation, permissions,
            agent execution, provider secrets, and database access.
          </p>
          <Link className="text-link" href="/workspace">
            See the workspace preview <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="principle-list">
          {principles.map((principle, index) => (
            <div className="principle-item" key={principle}>
              <span className="principle-index">0{index + 1}</span>
              <strong>{principle}</strong>
              <span className="principle-arrow" aria-hidden="true">↗</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="marketing-footer">
        <Link className="footer-brand" href="/">VOICE / TEXT</Link>
        <span>Next.js · NestJS · TypeORM · PostgreSQL</span>
        <span>Built in tested, explicit phases.</span>
      </footer>
    </main>
  );
}
