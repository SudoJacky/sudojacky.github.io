import { Suspense } from "react";
import { useParams } from "react-router-dom";
import ArticleLayout from "../components/layout/ArticleLayout";
import PageLoading from "../components/layout/PageLoading";
import { notes } from "../content/contentRegistry";
import NotFoundPage from "./NotFoundPage";

export default function NotePage() {
  const { slug } = useParams();
  const note = notes.find((item) => item.slug === slug);

  if (!note) return <NotFoundPage />;

  const CustomNote = note.component;
  if (CustomNote) {
    return (
      <Suspense fallback={<PageLoading />}>
        <CustomNote note={note} />
      </Suspense>
    );
  }

  if (!note.body) return <NotFoundPage />;

  return <ArticleLayout label="NOTE" title={note.title} meta={note.date} body={note.body} />;
}
