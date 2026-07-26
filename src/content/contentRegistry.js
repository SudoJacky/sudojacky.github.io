import { lazy } from "react";
import apiReference from "./docs/virtualhome/api-reference.md?raw";
import architecture from "./docs/virtualhome/architecture.md?raw";
import dataAndSync from "./docs/virtualhome/data-and-sync.md?raw";
import gettingStarted from "./docs/virtualhome/getting-started.md?raw";
import introduction from "./docs/virtualhome/introduction.md?raw";
import agentConversationCompaction from "./notes/agent-conversation-compaction.md?raw";
import fromAgentLineToTaskGraph from "./notes/from-agent-line-to-task-graph.md?raw";
import fromPromptToAutonomousLoop from "./notes/from-prompt-to-autonomous-loop.md?raw";

// Add `component: lazy(() => import("..."))` when an entry needs a fully
// custom page. Entries without one continue to use the shared page template.
export const notes = [
  {
    slug: "from-agent-line-to-task-graph",
    date: "2026-07-25",
    title: "当 Agent 不再排队：从线性流程到任务图",
    summary: "多步骤 Agent 的瓶颈常常不是模型，而是把没有依赖的工作排成一条线。怎样用节点、边、汇合、路由和验证重新组织任务。",
    body: fromAgentLineToTaskGraph,
    component: lazy(() => import("../pages/notes/FromAgentLineToTaskGraphPage")),
  },
  {
    slug: "from-prompt-to-autonomous-loop",
    date: "2026-07-20",
    title: "从 Prompt 到 Loop，Agent 工程到底在工程什么？",
    summary: "当一次回答变成一段工作，再变成无人盯守的持续执行，工程重心怎样移到上下文、运行环境和反馈闭环。",
    body: fromPromptToAutonomousLoop,
    component: lazy(() => import("../pages/notes/FromPromptToAutonomousLoopPage")),
  },
  {
    slug: "agent-conversation-compaction",
    date: "2026-07-20",
    title: "会话压缩之后，Agent 还记得什么？",
    summary: "上下文快满时，Agent 会怎样删掉过去，又怎样避免把用户的原话一起删没。",
    body: agentConversationCompaction,
    component: lazy(() => import("../pages/notes/AgentConversationCompactionPage")),
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
