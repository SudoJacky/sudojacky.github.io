import { NavLink, useParams } from "react-router-dom";
import DocSectionList from "../components/docs/DocSectionList";
import PageIntro from "../components/layout/PageIntro";
import { countProjectDocs } from "../content/docNavigation";
import { docProjects } from "../content/contentRegistry";
import NotFoundPage from "./NotFoundPage";

export default function ProjectDocsPage() {
  const { projectSlug } = useParams();
  const project = docProjects.find((item) => item.slug === projectSlug);

  if (!project) return <NotFoundPage />;

  const docCount = countProjectDocs(project);

  return (
    <main className="interior-page docs-directory-page">
      <NavLink className="back-link docs-directory-back" to="/docs">
        ← All documentation
      </NavLink>
      <PageIntro
        label={`${project.title.toUpperCase()} DOCUMENTATION`}
        title={`${project.title} documentation.`}
        copy={project.summary}
      />
      <div className="docs-directory-meta" aria-label="Documentation overview">
        <span>{project.status}</span>
        <span>{docCount} {docCount === 1 ? "document" : "documents"}</span>
        <span>{project.sections.length} {project.sections.length === 1 ? "section" : "sections"}</span>
      </div>
      <div className="docs-section-stack docs-directory-sections">
        <DocSectionList project={project} sections={project.sections} />
      </div>
    </main>
  );
}
