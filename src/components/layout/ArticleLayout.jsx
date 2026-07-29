import { NavLink } from "react-router-dom";
import MarkdownArticleLayout from "../article/MarkdownArticleLayout";
import { markdownRemarkPlugins } from "../article/markdownConfig";
import ReactMarkdown from "react-markdown";

export default function ArticleLayout({
  label,
  title,
  meta,
  body,
  docProject,
  showToc = false,
}) {
  const header = (
    <>
      <p className="section-label">{label}</p>
      <h1>{title}</h1>
      <p className="article-meta">{meta}</p>
    </>
  );

  if (showToc) {
    return (
      <main className="article-layout article-layout-toc">
        <MarkdownArticleLayout
          articleClassName="article"
          body={body}
          className="markdown-article-layout--embedded"
        >
          {header}
        </MarkdownArticleLayout>
      </main>
    );
  }

  return (
    <main className={docProject ? "article-layout" : "article-layout article-layout-single"}>
      {docProject && (
        <aside className="article-nav">
          <NavLink className="back-link" to={`/docs/${docProject.slug}`}>
            ← {docProject.title} documentation
          </NavLink>
          <p className="article-nav-project">{docProject.title}</p>
          {docProject.sections.map((section) => (
            <div className="article-nav-section" key={section.title}>
              <p className="section-label">{section.title}</p>
              {section.docs.map((doc) => (
                <NavLink key={doc.slug} to={`/docs/${docProject.slug}/${doc.slug}`}>
                  {doc.title}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>
      )}
      <article className="article">
        {header}
        <ReactMarkdown remarkPlugins={markdownRemarkPlugins}>{body}</ReactMarkdown>
      </article>
    </main>
  );
}
