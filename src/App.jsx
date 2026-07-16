import { useEffect, useState } from "react";
import { HashRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowRight,
  FileText,
  HouseLine,
  List,
  X,
} from "@phosphor-icons/react";
import latestNote from "./content/notes/building-in-public.md?raw";
import introduction from "./content/docs/virtualhome/introduction.md?raw";
import gettingStarted from "./content/docs/virtualhome/getting-started.md?raw";
import architecture from "./content/docs/virtualhome/architecture.md?raw";
import dataAndSync from "./content/docs/virtualhome/data-and-sync.md?raw";
import apiReference from "./content/docs/virtualhome/api-reference.md?raw";

const notes = [
  {
    slug: "building-in-public",
    date: "2026-07-16",
    displayDate: "JUL 16\n2026",
    title: "Building software that explains itself",
    summary: "Why documentation, observability, and clear boundaries belong in the product—not in an afterthought.",
    tags: ["systems", "documentation", "engineering"],
    body: latestNote,
  },
  {
    slug: "boring-architecture",
    date: "2026-07-08",
    displayDate: "JUL 08\n2026",
    title: "Boring architecture is a feature",
    summary: "A practical case for small modules, explicit contracts, and fewer invisible decisions.",
    tags: ["architecture", "maintainability"],
  },
  {
    slug: "debuggable-by-design",
    date: "2026-06-29",
    displayDate: "JUN 29\n2026",
    title: "Debuggable by design",
    summary: "Tracing failures through a system without hiding the evidence that makes them solvable.",
    tags: ["observability", "debugging"],
  },
];

const docs = [
  { slug: "introduction", title: "Introduction", summary: "Overview and goals", body: introduction },
  { slug: "getting-started", title: "Getting Started", summary: "Install, configure, run", body: gettingStarted },
  { slug: "architecture", title: "Architecture", summary: "System design and data flow", body: architecture },
  { slug: "data-and-sync", title: "Data & Sync", summary: "Local storage and simulation state", body: dataAndSync },
  { slug: "api-reference", title: "API Reference", summary: "HTTP API and schemas", body: apiReference },
];

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="wordmark" to="/" aria-label="SudoJacky home">SudoJacky</NavLink>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={24} /> : <List size={24} />}
        </button>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          <NavLink className={({ isActive }) => (isActive || location.pathname === "/" ? "active" : undefined)} to="/notes">Notes</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/docs">Docs</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:slug" element={<NotePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/virtualhome/:slug" element={<DocPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <footer className="site-footer">
        <span>© 2026 SudoJacky</span>
        <span>Built in public.</span>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PERSONAL WORKBENCH</p>
          <h1>Notes from the<br />workbench.<span className="cursor-mark">_</span></h1>
          <p className="hero-intro">I build software, document the hard parts,<br />and share what survives contact with reality.</p>
          <div className="hero-actions">
            <NavLink className="button button-primary" to="/notes/building-in-public">
              Open latest note <ArrowRight aria-hidden="true" size={20} />
            </NavLink>
            <NavLink className="button button-secondary" to="/docs">
              Explore docs <ArrowRight aria-hidden="true" size={20} />
            </NavLink>
          </div>
        </div>

        <aside className="current-work" aria-labelledby="current-work-title">
          <p className="section-label">CURRENTLY WORKING ON</p>
          <h2 id="current-work-title">VirtualHome</h2>
          <p>A standalone, simulation-first digital twin for exploring household routines and automation.</p>
          <dl>
            <div><dt>FOCUS</dt><dd>Runtime simulation</dd></div>
            <div><dt>STACK</dt><dd>TypeScript / Fastify / SQLite</dd></div>
            <div><dt>STATUS</dt><dd className="status">Active</dd></div>
            <div><dt>UPDATED</dt><dd>Jul 16, 2026</dd></div>
          </dl>
        </aside>
      </section>

      <section className="home-grid">
        <div className="worklog">
          <SectionHeading label="WORKLOG" link="/notes" linkLabel="View all notes" />
          <div className="timeline">
            {notes.map((note) => <TimelineEntry key={note.slug} note={note} />)}
          </div>
        </div>
        <DocsSpotlight />
      </section>
    </main>
  );
}

function SectionHeading({ label, link, linkLabel }) {
  return (
    <div className="section-heading">
      <p className="section-label">{label}</p>
      <NavLink className="text-link" to={link}>{linkLabel} <ArrowRight aria-hidden="true" size={17} /></NavLink>
    </div>
  );
}

function TimelineEntry({ note }) {
  return (
    <article className="timeline-entry">
      <time dateTime={note.date}>{note.displayDate.split("\n").map((part) => <span key={part}>{part}</span>)}</time>
      <span className="timeline-dot" aria-hidden="true" />
      <div>
        <NavLink className="entry-title" to={`/notes/${note.slug}`}>{note.title}</NavLink>
        <p>{note.summary}</p>
        <ul className="tag-list" aria-label="Tags">
          {note.tags.map((tag) => <li key={tag}>#{tag}</li>)}
        </ul>
      </div>
    </article>
  );
}

function DocsSpotlight() {
  return (
    <article className="docs-spotlight">
      <SectionHeading label="PROJECT DOCS SPOTLIGHT" link="/projects" linkLabel="View all projects" />
      <div className="project-heading">
        <HouseLine className="project-icon" aria-hidden="true" size={86} weight="thin" />
        <div>
          <h2>VirtualHome</h2>
          <div className="project-meta"><span>v0.1.0</span><i aria-hidden="true" /><strong>Active</strong></div>
        </div>
      </div>
      <p className="project-description">A standalone household simulation for exploring routines, events, maintenance, and automation behavior.</p>
      <div className="doc-list">
        {docs.map((doc) => (
          <NavLink key={doc.slug} to={`/docs/virtualhome/${doc.slug}`}>
            <FileText aria-hidden="true" size={22} />
            <span>{doc.title}</span>
            <small>{doc.summary}</small>
            <ArrowRight aria-hidden="true" size={20} />
          </NavLink>
        ))}
      </div>
    </article>
  );
}

function NotesPage() {
  return (
    <main className="interior-page">
      <PageIntro label="NOTES" title="Field notes from the workbench." copy="Longer thoughts on systems, tools, debugging, and the choices that shape software." />
      <div className="index-list">
        {notes.map((note, index) => (
          <NavLink className="index-row" key={note.slug} to={`/notes/${note.slug}`}>
            <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
            <div><time>{note.date}</time><h2>{note.title}</h2><p>{note.summary}</p></div>
            <ArrowRight aria-hidden="true" size={24} />
          </NavLink>
        ))}
      </div>
    </main>
  );
}

function NotePage() {
  const slug = useLocation().pathname.split("/").pop();
  const note = notes.find((item) => item.slug === slug);
  if (!note?.body) return <NotFoundPage />;
  return <ArticleLayout label="NOTE" title={note.title} meta={note.date} body={note.body} />;
}

function ProjectsPage() {
  return (
    <main className="interior-page">
      <PageIntro label="PROJECTS" title="Things built to answer a question." copy="Selected experiments and systems, with the decisions and documentation kept close to the code." />
      <NavLink className="project-row" to="/docs">
        <span className="project-index">01</span>
        <div><p className="section-label">ACTIVE PROJECT</p><h2>VirtualHome</h2><p>A simulation-first digital twin for household routines and automation.</p></div>
        <span className="project-stack">TypeScript<br />Fastify<br />SQLite</span>
        <ArrowRight aria-hidden="true" size={28} />
      </NavLink>
    </main>
  );
}

function DocsPage() {
  return (
    <main className="interior-page">
      <PageIntro label="DOCUMENTATION" title="Project knowledge, kept navigable." copy="Start with the overview, then follow the implementation from architecture to data and API details." />
      <div className="docs-index">
        <aside><p className="section-label">PROJECT</p><h2>VirtualHome</h2><p>v0.1.0 · Active</p></aside>
        <div className="doc-list doc-list-large">
          {docs.map((doc) => (
            <NavLink key={doc.slug} to={`/docs/virtualhome/${doc.slug}`}>
              <FileText aria-hidden="true" size={24} /><span>{doc.title}</span><small>{doc.summary}</small><ArrowRight aria-hidden="true" size={21} />
            </NavLink>
          ))}
        </div>
      </div>
    </main>
  );
}

function DocPage() {
  const slug = useLocation().pathname.split("/").pop();
  const doc = docs.find((item) => item.slug === slug);
  if (!doc) return <NotFoundPage />;
  return <ArticleLayout label="VIRTUALHOME DOCS" title={doc.title} meta={doc.summary} body={doc.body} showDocNav />;
}

function ArticleLayout({ label, title, meta, body, showDocNav = false }) {
  return (
    <main className="article-layout">
      {showDocNav && (
        <aside className="article-nav">
          <NavLink className="back-link" to="/docs">← All documentation</NavLink>
          <p className="section-label">VIRTUALHOME</p>
          {docs.map((doc) => <NavLink key={doc.slug} to={`/docs/virtualhome/${doc.slug}`}>{doc.title}</NavLink>)}
        </aside>
      )}
      <article className="article">
        <p className="section-label">{label}</p>
        <h1>{title}</h1>
        <p className="article-meta">{meta}</p>
        <ReactMarkdown>{body}</ReactMarkdown>
      </article>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="interior-page about-page">
      <PageIntro label="ABOUT" title="I make software and leave a trail." copy="This site is where I collect the useful parts: what I built, what broke, and what I learned while fixing it." />
      <div className="about-grid">
        <p>The first version deliberately keeps the biography short. Replace this paragraph with the story you want visitors to remember.</p>
        <div><p className="section-label">ELSEWHERE</p><a href="https://github.com/SudoJacky" target="_blank" rel="noreferrer">GitHub <ArrowRight aria-hidden="true" size={18} /></a></div>
      </div>
    </main>
  );
}

function PageIntro({ label, title, copy }) {
  return <header className="page-intro"><p className="section-label">{label}</p><h1>{title}</h1><p>{copy}</p></header>;
}

function NotFoundPage() {
  return <main className="not-found"><p className="section-label">404</p><h1>Nothing on this bench.</h1><NavLink className="text-link" to="/">Return home <ArrowRight aria-hidden="true" size={18} /></NavLink></main>;
}

export function App() {
  return <HashRouter><AppShell /></HashRouter>;
}
