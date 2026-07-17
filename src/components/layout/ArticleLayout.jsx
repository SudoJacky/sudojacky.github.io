import ReactMarkdown from "react-markdown";
import { NavLink } from "react-router-dom";
import { docs } from "../../content/contentRegistry";

export default function ArticleLayout({ label, title, meta, body, showDocNav = false }) {
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
        <p className="section-label">{label}</p>
        <h1>{title}</h1>
        <p className="article-meta">{meta}</p>
        <ReactMarkdown>{body}</ReactMarkdown>
      </article>
    </main>
  );
}
