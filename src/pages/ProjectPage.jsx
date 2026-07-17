import { Suspense } from "react";
import { useParams } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import PageLoading from "../components/layout/PageLoading";
import { projects } from "../content/contentRegistry";
import NotFoundPage from "./NotFoundPage";

export default function ProjectPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);

  if (!project) return <NotFoundPage />;

  const CustomProject = project.component;
  if (CustomProject) {
    return (
      <Suspense fallback={<PageLoading />}>
        <CustomProject project={project} />
      </Suspense>
    );
  }

  return (
    <main className="interior-page">
      <PageIntro label={project.status} title={project.title} copy={project.summary} />
    </main>
  );
}
