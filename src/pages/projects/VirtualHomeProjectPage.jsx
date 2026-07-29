import {
  ArrowUpRight,
  ClockCounterClockwise,
  Cube,
  GithubLogo,
  House,
  Pulse,
  UsersThree,
} from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import VirtualHomeScrollShowcase from "../../components/virtualhome/VirtualHomeScrollShowcase";

const capabilities = [
  {
    icon: Pulse,
    title: "Simulation engine",
    copy: "A deterministic household clock advances routines, device changes, and ambient events before they reach a real home.",
  },
  {
    icon: UsersThree,
    title: "Household agents",
    copy: "Residents and pets carry schedules, locations, needs, and actions that make the digital twin feel inhabited.",
  },
  {
    icon: Cube,
    title: "Spatial state",
    copy: "Nine connected rooms keep occupancy, fixtures, devices, and environmental readings grounded in a visible floor plan.",
  },
  {
    icon: ClockCounterClockwise,
    title: "History and replay",
    copy: "SQLite-backed events make the causes behind a state change inspectable instead of leaving only the latest value.",
  },
];

export default function VirtualHomeProjectPage({ project }) {
  return (
    <main className="interior-page virtualhome-project-page">
      <section className="virtualhome-project-hero" aria-labelledby="virtualhome-title">
        <header className="virtualhome-project-intro">
          <p className="section-label">PROJECT / VIRTUALHOME</p>
          <h1 id="virtualhome-title">{project.title}</h1>
          <p>
            A simulation-first digital twin where rooms, residents, devices, and
            routines can be observed together before any automation reaches a
            physical home.
          </p>

          <div className="virtualhome-project-actions">
            <a
              className="button button-primary"
              href="https://github.com/SudoJacky/VirtualHome"
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogo aria-hidden="true" size={20} />
              View source
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
            <NavLink className="text-link" to="/docs/virtualhome">
              Read documentation
              <ArrowUpRight aria-hidden="true" size={18} />
            </NavLink>
          </div>
        </header>

        <aside className="virtualhome-runtime-panel" aria-label="VirtualHome project profile">
          <div className="virtualhome-brand">
            <span aria-hidden="true"><House size={54} weight="light" /></span>
            <div>
              <p className="section-label">SIMULATION-FIRST DIGITAL TWIN</p>
              <h2>VirtualHome</h2>
            </div>
          </div>

          <dl className="virtualhome-runtime-list">
            <div>
              <dt>Status</dt>
              <dd><span className="virtualhome-status-dot" />Active</dd>
            </div>
            <div>
              <dt>Layout</dt>
              <dd>9 connected rooms</dd>
            </div>
            <div>
              <dt>Household</dt>
              <dd>4 people + 1 pet</dd>
            </div>
            <div>
              <dt>Devices</dt>
              <dd>30 simulated nodes</dd>
            </div>
          </dl>
        </aside>
      </section>

      <VirtualHomeScrollShowcase />

      <section className="virtualhome-project-statement" aria-labelledby="virtualhome-question">
        <p className="section-label">THE QUESTION</p>
        <div>
          <h2 id="virtualhome-question">
            Can a home be understood as a living system before it is automated?
          </h2>
          <p>
            VirtualHome makes the household model visible at every scale. Start
            with the complete building, isolate one floor, then inspect the
            people, devices, and decisions that cause a room to change.
          </p>
        </div>
      </section>

      <section className="virtualhome-capabilities" aria-labelledby="virtualhome-capabilities-title">
        <div className="virtualhome-section-heading">
          <p className="section-label">CORE SYSTEMS</p>
          <h2 id="virtualhome-capabilities-title">
            Built to explain household behavior, not only display it.
          </h2>
        </div>

        <div className="virtualhome-capability-list">
          {capabilities.map(({ icon: Icon, title, copy }, index) => (
            <article className="virtualhome-capability" key={title}>
              <span className="virtualhome-capability-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon aria-hidden="true" size={28} weight="light" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="virtualhome-system-map" aria-labelledby="virtualhome-system-map-title">
        <div>
          <p className="section-label">SYSTEM SHAPE</p>
          <h2 id="virtualhome-system-map-title">From one clock to one explainable home.</h2>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>Simulation clock</strong>
            <small>Advance a deterministic day</small>
          </li>
          <li>
            <span>02</span>
            <strong>Household agents</strong>
            <small>Turn routines into actions</small>
          </li>
          <li>
            <span>03</span>
            <strong>Digital twin</strong>
            <small>Project the complete home state</small>
          </li>
          <li>
            <span>04</span>
            <strong>Event history</strong>
            <small>Trace every meaningful change</small>
          </li>
        </ol>
      </section>
    </main>
  );
}
