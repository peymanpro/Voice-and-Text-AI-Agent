const capabilities = [
  {
    number: "01",
    title: "Text and voice",
    description:
      "A single conversation workspace for typed prompts, reviewed transcripts, and optional spoken responses.",
  },
  {
    number: "02",
    title: "Evidence you can inspect",
    description:
      "Retrieved source excerpts and stable citations are planned to make supportable answers easier to verify.",
  },
  {
    number: "03",
    title: "Bounded tool execution",
    description:
      "Typed tools, server-side authorization, explicit limits, and visible operational events are part of the design.",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Voice and Text AI Agent home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Voice / Text Agent</span>
        </a>
        <a
          className="top-link"
          href="https://github.com/peymanpro/Voice-and-Text-AI-Agent-Roadmap"
          target="_blank"
          rel="noreferrer"
        >
          Implementation roadmap <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="eyebrow">
          <span className="status-dot" />
          Engineering preview · In development
        </div>
        <h1 id="hero-title">
          An AI agent should do more than{" "}
          <span className="gradient-text">generate text.</span>
        </h1>
        <p className="hero-copy">
          A focused engineering project for voice and text interaction,
          evidence-grounded responses, controlled tools, and operational
          transparency—from the first prompt to a verifiable result.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#capabilities">
            Explore the design <span aria-hidden="true">↓</span>
          </a>
          <a
            className="secondary-action"
            href="https://github.com/peymanpro/Voice-and-Text-AI-Agent"
            target="_blank"
            rel="noreferrer"
          >
            View source <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-note">
          <span className="note-icon" aria-hidden="true">
            ◈
          </span>
          <p>
            This is the initial product shell. Agent, database, and speech workflows are
            being implemented in tested phases; they are not advertised here as already
            shipped.
          </p>
        </div>
      </section>

      <section
        className="capabilities"
        id="capabilities"
        aria-labelledby="capabilities-title"
      >
        <div className="section-heading">
          <div>
            <p className="section-kicker">The engineering goals</p>
            <h2 id="capabilities-title">Designed to be inspectable.</h2>
          </div>
          <p className="section-aside">
            Planned capabilities · Implementation status is tracked in GitHub.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article className="capability-card" key={capability.number}>
              <div className="card-topline">
                <span className="card-number">{capability.number}</span>
                <span className="planned-label">Planned</span>
              </div>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <span className="card-accent" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span>Built with a test-first, safety-conscious approach.</span>
        <span>Next.js · NestJS · TypeORM · PostgreSQL</span>
      </footer>
    </main>
  );
}
