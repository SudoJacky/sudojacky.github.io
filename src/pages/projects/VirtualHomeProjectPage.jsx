import { ArrowRight, FileText } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

export default function VirtualHomeProjectPage({ project }) {
  return (
    <main className="interior-page project-detail-page">
      <header className="page-intro">
        <p className="section-label">PROJECT / VIRTUALHOME</p>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </header>

      <section className="project-detail-grid" aria-labelledby="virtualhome-question">
        <div className="project-detail-copy">
          <p className="section-label">THE QUESTION</p>
          <h2 id="virtualhome-question">Can a home be tested before it is automated?</h2>
          <p>
            VirtualHome explores household routines as simulations first, keeping
            state, decisions, and automation behavior visible before they reach a
            real environment.
          </p>
        </div>

        <aside className="project-detail-meta" aria-label="Project details">
          <p className="section-label">STACK</p>
          <ul>
            {project.stack.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
          <NavLink className="text-link" to="/docs">
            <FileText aria-hidden="true" size={18} />
            Read the documentation
            <ArrowRight aria-hidden="true" size={18} />
          </NavLink>
        </aside>
      </section>
    </main>
  );
}
