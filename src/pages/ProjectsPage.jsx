import { ArrowRight } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import { projects } from "../content/contentRegistry";

export default function ProjectsPage() {
  return (
    <main className="interior-page">
      <PageIntro
        label="PROJECTS"
        title="Projects"
        copy="Selected experiments and systems, with the decisions and documentation kept close to the code."
      />
      <div className="project-list">
        {projects.map((project) => (
          <NavLink className="project-row" key={project.slug} to={`/projects/${project.slug}`}>
            <img className="project-preview" src={`${import.meta.env.BASE_URL}images/projects/${project.slug === "tinybot" ? "tinybot-workbench.webp" : "virtualhome-model.png"}`} alt={project.slug === "tinybot" ? "Tinybot task and report workspace" : "VirtualHome residential model"} loading="lazy" />
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
