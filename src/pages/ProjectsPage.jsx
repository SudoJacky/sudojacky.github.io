import { ArrowRight } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import { projects } from "../content/contentRegistry";

export default function ProjectsPage() {
  return (
    <main className="interior-page">
      <PageIntro
        label="PROJECTS"
        title="Things built to answer a question."
        copy="Selected experiments and systems, with the decisions and documentation kept close to the code."
      />
      <div className="project-list">
        {projects.map((project, index) => (
          <NavLink className="project-row" key={project.slug} to={`/projects/${project.slug}`}>
            <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="section-label">{project.status}</p>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
            </div>
            <span className="project-stack">
              {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
            </span>
            <ArrowRight aria-hidden="true" size={28} />
          </NavLink>
        ))}
      </div>
    </main>
  );
}
