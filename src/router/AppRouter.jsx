import { HashRouter, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import DocPage from "../pages/DocPage";
import DocsPage from "../pages/DocsPage";
import HomePage from "../pages/HomePage";
import NotePage from "../pages/NotePage";
import NotesPage from "../pages/NotesPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProjectPage from "../pages/ProjectPage";
import ProjectsPage from "../pages/ProjectsPage";

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:slug" element={<NotePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/:projectSlug/:slug" element={<DocPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
