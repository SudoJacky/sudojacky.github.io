import { ArrowRight, FileText } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import { docProjects } from "../content/contentRegistry";

export default function DocsPage() {
  return (
    <main className="interior-page">
      <PageIntro
        label="DOCUMENTATION"
        title="Tinybot first. Project knowledge, kept navigable."
        copy="Tinybot is the primary documentation track, organized from the first run and core concepts through architecture, configuration, and reference."
      />
      <div className="docs-projects">
        {docProjects.map((project) => (
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
              {project.sections.map((section) => (
                <section className="docs-section" key={section.title}>
                  <p className="section-label">{section.title}</p>
                  <div className="doc-list doc-list-large">
                    {section.docs.map((doc) => (
                      <NavLink key={doc.slug} to={`/docs/${project.slug}/${doc.slug}`}>
                        <FileText aria-hidden="true" size={24} />
                        <span>{doc.title}</span>
                        <small>{doc.summary}</small>
                        <ArrowRight aria-hidden="true" size={21} />
                      </NavLink>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
