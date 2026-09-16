import { NavLink } from "react-router-dom";
import MarkdownArticleLayout from "../article/MarkdownArticleLayout";

export default function ArticleLayout({ label, title, meta, body, docProject }) {
  return (
    <main className="article-layout article-layout-toc">
      {docProject && (
        <details className="doc-navigation" key={`navigation-${title}`}>
          <summary>{docProject.title} / {docProject.slug === "tinybot" ? "文档导航" : "Documentation"}</summary>
          <nav aria-label={`${docProject.title} documentation`}>
            <NavLink className="back-link" to={`/docs/${docProject.slug}`}>← All {docProject.title} documentation</NavLink>
            {docProject.sections.map((section) => (
              <div className="article-nav-section" key={section.title}>
                <p className="section-label">{section.title}</p>
                {section.docs.map((doc) => <NavLink key={doc.slug} to={`/docs/${docProject.slug}/${doc.slug}`}>{doc.title}</NavLink>)}
              </div>
            ))}
          </nav>
        </details>
      )}
      <MarkdownArticleLayout key={title} articleClassName="article" body={body} className="markdown-article-layout--embedded">
        <p className="section-label" lang="en">{label}</p>
        <h1>{title}</h1>
        <p className="article-meta">{meta}</p>
      </MarkdownArticleLayout>
    </main>
  );
}
