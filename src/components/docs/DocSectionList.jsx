import { ArrowRight, FileText } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

export default function DocSectionList({ project, sections }) {
  return sections.map((section) => (
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
  ));
}
