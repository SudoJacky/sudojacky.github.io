import { useParams } from "react-router-dom";
import ArticleLayout from "../components/layout/ArticleLayout";
import { docProjects } from "../content/contentRegistry";
import NotFoundPage from "./NotFoundPage";

export default function DocPage() {
  const { projectSlug, slug } = useParams();
  const project = docProjects.find((item) => item.slug === projectSlug);
  const doc = project?.sections
    .flatMap((section) => section.docs)
    .find((item) => item.slug === slug);

  if (!project || !doc) return <NotFoundPage />;

  return (
    <ArticleLayout
      label={`${project.title.toUpperCase()} DOCS`}
      title={doc.title}
      meta={doc.summary}
      body={doc.body}
      docProject={project}
    />
  );
}
