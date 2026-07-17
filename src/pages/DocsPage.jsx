import { ArrowRight, FileText } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import { docs } from "../content/contentRegistry";

export default function DocsPage() {
  return (
    <main className="interior-page">
      <PageIntro
        label="DOCUMENTATION"
        title="Project knowledge, kept navigable."
        copy="Start with the overview, then follow the implementation from architecture to data and API details."
      />
      <div className="docs-index">
        <aside>
          <p className="section-label">PROJECT</p>
          <h2>VirtualHome</h2>
          <p>v0.1.0 · Active</p>
        </aside>
        <div className="doc-list doc-list-large">
          {docs.map((doc) => (
            <NavLink key={doc.slug} to={`/docs/virtualhome/${doc.slug}`}>
              <FileText aria-hidden="true" size={24} />
              <span>{doc.title}</span>
              <small>{doc.summary}</small>
              <ArrowRight aria-hidden="true" size={21} />
            </NavLink>
          ))}
        </div>
      </div>
    </main>
  );
}
