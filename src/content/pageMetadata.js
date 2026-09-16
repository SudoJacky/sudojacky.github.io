import { docProjects, notes, projects } from "./contentRegistry";

export function getPageMetadata(pathname) {
  const [, section, slug, docSlug] = pathname.split("/");
  if (!section) return { title: "Jacky — Agent systems & engineering notes", lang: "en" };
  const indexTitles = { notes: "Notes", projects: "Projects", docs: "Documentation" };
  if (!slug && indexTitles[section]) return { title: `${indexTitles[section]} — Jacky`, lang: "en" };
  if (section === "notes") {
    const note = notes.find((item) => item.slug === slug);
    if (note) return { title: `${note.title} — Jacky`, lang: "zh-CN" };
  }
  if (section === "projects") {
    const project = projects.find((item) => item.slug === slug);
    if (project) return { title: `${project.title} — Jacky`, lang: "en" };
  }
  if (section === "docs") {
    const project = docProjects.find((item) => item.slug === slug);
    if (project && !docSlug) return { title: `${project.title} documentation — Jacky`, lang: "en" };
    const doc = project?.sections.flatMap((item) => item.docs).find((item) => item.slug === docSlug);
    if (doc) return { title: `${doc.title} — Jacky`, lang: slug === "tinybot" ? "zh-CN" : "en" };
  }
  return { title: "Page not found — Jacky", lang: "en" };
}
