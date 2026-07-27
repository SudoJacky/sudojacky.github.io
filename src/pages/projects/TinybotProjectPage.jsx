import {
  ArrowUpRight,
  Brain,
  DesktopTower,
  GithubLogo,
  GitBranch,
  PlugsConnected,
} from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import tinybotLogo from "../../assets/tinybot-logo.svg";
import TinybotMorphShowcase from "../../components/tinybot/TinybotMorphShowcase";

const capabilities = [
  {
    icon: DesktopTower,
    title: "Native workbench",
    copy: "A focused desktop surface built with Tauri and React, backed by a Rust-native runtime.",
  },
  {
    icon: PlugsConnected,
    title: "Tools that connect",
    copy: "Skills, built-in tools, and MCP servers turn a conversation into work across real systems.",
  },
  {
    icon: Brain,
    title: "Memory with context",
    copy: "Searchable memory and experience retrieval keep useful context close without hiding where it came from.",
  },
  {
    icon: GitBranch,
    title: "Cowork orchestration",
    copy: "Multi-agent sessions expose branches, agent steps, blockers, and final-result selection in one control plane.",
  },
];

export default function TinybotProjectPage({ project }) {
  return (
    <main className="interior-page tinybot-project-page">
      <section className="tinybot-project-hero" aria-labelledby="tinybot-title">
        <header className="tinybot-project-intro">
          <p className="section-label">PROJECT / TINYBOT</p>
          <h1 id="tinybot-title">{project.title}</h1>
          <p>
            A native AI workbench that brings agents, tools, memory, automation,
            and multi-agent collaboration into one inspectable desktop app.
          </p>

          <div className="tinybot-project-actions">
            <a
              className="button button-primary"
              href="https://github.com/SudoJacky/tinybot"
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogo aria-hidden="true" size={20} />
              View source
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            <NavLink className="text-link" to="/docs/tinybot/agent-loop-persistence">
              Read documentation
              <ArrowUpRight aria-hidden="true" size={18} />
            </NavLink>
            <a
              className="text-link"
              href="https://github.com/SudoJacky/tinybot/releases"
              target="_blank"
              rel="noreferrer"
            >
              Browse releases
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </div>
        </header>

        <aside className="tinybot-runtime-panel" aria-label="Tinybot project profile">
          <div className="tinybot-brand">
            <img src={tinybotLogo} alt="" />
            <div>
              <p className="section-label">PERSONAL AI WORKBENCH</p>
              <h2>Tinybot</h2>
            </div>
          </div>

          <dl className="tinybot-runtime-list">
            <div>
              <dt>Status</dt>
              <dd><span className="tinybot-status-dot" />Active</dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>Rust native</dd>
            </div>
            <div>
              <dt>Desktop</dt>
              <dd>Tauri 2</dd>
            </div>
            <div>
              <dt>Interface</dt>
              <dd>React 19</dd>
            </div>
          </dl>
        </aside>
      </section>

      <TinybotMorphShowcase />

      <section className="tinybot-project-statement" aria-labelledby="tinybot-question">
        <p className="section-label">THE QUESTION</p>
        <div>
          <h2 id="tinybot-question">
            What if an assistant showed its work instead of hiding the system behind the chat?
          </h2>
          <p>
            Tinybot treats the conversation as one part of a larger workbench.
            Runtime state, approvals, tools, skills, memory, and collaborating
            agents stay visible so a task can be followed, understood, and debugged.
          </p>
        </div>
      </section>

      <section className="tinybot-capabilities" aria-labelledby="tinybot-capabilities-title">
        <div className="tinybot-section-heading">
          <p className="section-label">CORE SYSTEMS</p>
          <h2 id="tinybot-capabilities-title">Built around the work, not only the prompt.</h2>
        </div>

        <div className="tinybot-capability-list">
          {capabilities.map(({ icon: Icon, title, copy }, index) => (
            <article className="tinybot-capability" key={title}>
              <span className="tinybot-capability-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon aria-hidden="true" size={28} weight="light" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tinybot-system-map" aria-labelledby="tinybot-system-map-title">
        <div>
          <p className="section-label">SYSTEM SHAPE</p>
          <h2 id="tinybot-system-map-title">One workbench, clear boundaries.</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>Desktop</strong>
            <small>Navigate and inspect</small>
          </li>
          <li>
            <span>02</span>
            <strong>Agent runtime</strong>
            <small>Plan and execute</small>
          </li>
          <li>
            <span>03</span>
            <strong>Tools + MCP</strong>
            <small>Reach external systems</small>
          </li>
          <li>
            <span>04</span>
            <strong>Memory</strong>
            <small>Retain useful context</small>
          </li>
        </ol>
      </section>
    </main>
  );
}
