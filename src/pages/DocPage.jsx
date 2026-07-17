import { useParams } from "react-router-dom";
import ArticleLayout from "../components/layout/ArticleLayout";
import { docs } from "../content/contentRegistry";
import NotFoundPage from "./NotFoundPage";

export default function DocPage() {
  const { slug } = useParams();
  const doc = docs.find((item) => item.slug === slug);

  if (!doc) return <NotFoundPage />;

  return (
    <ArticleLayout
      label="VIRTUALHOME DOCS"
      title={doc.title}
      meta={doc.summary}
      body={doc.body}
      showDocNav
    />
  );
}
