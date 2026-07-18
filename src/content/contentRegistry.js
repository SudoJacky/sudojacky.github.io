import { lazy } from "react";
import apiReference from "./docs/virtualhome/api-reference.md?raw";
import architecture from "./docs/virtualhome/architecture.md?raw";
import dataAndSync from "./docs/virtualhome/data-and-sync.md?raw";
import gettingStarted from "./docs/virtualhome/getting-started.md?raw";
import introduction from "./docs/virtualhome/introduction.md?raw";
import buildingInPublic from "./notes/building-in-public.md?raw";

// Add `component: lazy(() => import("..."))` when an entry needs a fully
// custom page. Entries without one continue to use the shared page template.
export const notes = [
  {
    slug: "building-in-public",
    date: "2026-07-16",
    title: "Building software that explains itself",
    summary: "Why documentation, observability, and clear boundaries belong in the product—not in an afterthought.",
    body: buildingInPublic,
  },
  {
    slug: "boring-architecture",
    date: "2026-07-08",
    title: "Boring architecture is a feature",
    summary: "A practical case for small modules, explicit contracts, and fewer invisible decisions.",
  },
  {
    slug: "debuggable-by-design",
    date: "2026-06-29",
    title: "Debuggable by design",
    summary: "Tracing failures through a system without hiding the evidence that makes them solvable.",
  },
];

export const projects = [
  {
    slug: "tinybot",
    status: "ACTIVE PROJECT",
    title: "Tinybot",
    summary: "A native AI workbench for agents, memory, tools, and multi-agent collaboration.",
    stack: ["Rust", "Tauri", "React"],
    component: lazy(() => import("../pages/projects/TinybotProjectPage")),
  },
  {
    slug: "virtualhome",
    status: "ACTIVE PROJECT",
    title: "VirtualHome",
    summary: "A simulation-first digital twin for household routines and automation.",
    stack: ["TypeScript", "Fastify", "SQLite"],
    component: lazy(() => import("../pages/projects/VirtualHomeProjectPage")),
  },
];

export const docs = [
  { slug: "introduction", title: "Introduction", summary: "Overview and goals", body: introduction },
  { slug: "getting-started", title: "Getting Started", summary: "Install, configure, run", body: gettingStarted },
  { slug: "architecture", title: "Architecture", summary: "System design and data flow", body: architecture },
  { slug: "data-and-sync", title: "Data & Sync", summary: "Local storage and simulation state", body: dataAndSync },
  { slug: "api-reference", title: "API Reference", summary: "HTTP API and schemas", body: apiReference },
];
