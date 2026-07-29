import { ArrowRight } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import DocSectionList from "../components/docs/DocSectionList";
import PageIntro from "../components/layout/PageIntro";
import { docProjects } from "../content/contentRegistry";
import { countProjectDocs, takeDocSections } from "../content/docNavigation";

export default function DocsPage() {
  return (
    <main className="interior-page">
      <PageIntro
        label="DOCUMENTATION"
        title="Tinybot first. Project knowledge, kept navigable."
        copy="Tinybot is the primary documentation track, organized from the first run and core concepts through architecture, configuration, and reference."
      />
      <div className="docs-projects">
        {docProjects.map((project) => {
          const docCount = countProjectDocs(project);
          const previewSections = takeDocSections(project.sections);

          return (
            <section
              className={`docs-index${project.slug === "tinybot" ? " docs-index-primary" : ""}`}
              key={project.slug}
              aria-labelledby={`${project.slug}-docs-title`}
            >
              <aside>
                <p className="section-label">{project.label}</p>
                <h2 id={`${project.slug}-docs-title`}>{project.title}</h2>
                <p className="docs-project-status">{project.status}</p>
                <p className="docs-project-summary">{project.summary}</p>
              </aside>
              <div className="docs-section-stack">
                <DocSectionList project={project} sections={previewSections} />
                <NavLink className="docs-directory-link" to={`/docs/${project.slug}`}>
                  <span>View all {project.title} documentation</span>
                  <small>{docCount} {docCount === 1 ? "document" : "documents"}</small>
                  <ArrowRight aria-hidden="true" size={21} />
                </NavLink>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
