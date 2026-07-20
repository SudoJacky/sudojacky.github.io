import { NavLink } from "react-router-dom";
import { docs } from "../../content/contentRegistry";
import MarkdownArticleLayout from "../article/MarkdownArticleLayout";
import ReactMarkdown from "react-markdown";

export default function ArticleLayout({
  label,
  title,
  meta,
  body,
  showDocNav = false,
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
    <main className={showDocNav ? "article-layout" : "article-layout article-layout-single"}>
      {showDocNav && (
        <aside className="article-nav">
          <NavLink className="back-link" to="/docs">← All documentation</NavLink>
          <p className="section-label">VIRTUALHOME</p>
          {docs.map((doc) => (
            <NavLink key={doc.slug} to={`/docs/virtualhome/${doc.slug}`}>{doc.title}</NavLink>
          ))}
        </aside>
      )}
      <article className="article">
        {header}
        <ReactMarkdown>{body}</ReactMarkdown>
      </article>
    </main>
  );
}
