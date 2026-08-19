import { lazy } from "react";
import tinybotAgentLongTermMemory from "./docs/tinybot/agent-long-term-memory.md?raw";
import tinybotAgentLoopPersistence from "./docs/tinybot/agent-loop-persistence.md?raw";
import tinybotMultiWorkspaceProjectCoordinator from "./docs/tinybot/multi-workspace-project-coordinator.md?raw";
import apiReference from "./docs/virtualhome/api-reference.md?raw";
import architecture from "./docs/virtualhome/architecture.md?raw";
import dataAndSync from "./docs/virtualhome/data-and-sync.md?raw";
import gettingStarted from "./docs/virtualhome/getting-started.md?raw";
import introduction from "./docs/virtualhome/introduction.md?raw";
import agentPluginsPortableBox from "./notes/agent-plugins-portable-box.md?raw";
import agentConversationCompaction from "./notes/agent-conversation-compaction.md?raw";
import agentRoomCoordination from "./notes/agent-room-coordination.md?raw";
import efficientCodingAgentSessions from "./notes/efficient-coding-agent-sessions.md?raw";
import fromAgentLineToTaskGraph from "./notes/from-agent-line-to-task-graph.md?raw";
import fromCompletionsToResponses from "./notes/from-completions-to-responses.md?raw";
import fromPromptToAutonomousLoop from "./notes/from-prompt-to-autonomous-loop.md?raw";
import huaweiA2aThirdPartyAgent from "./notes/huawei-a2a-third-party-agent.md?raw";

// Add `component: lazy(() => import("..."))` when an entry needs a fully
// custom page. Entries without one continue to use the shared page template.
export const notes = [
  {
    slug: "efficient-coding-agent-sessions",
    date: "2026-08-19",
    title: "同一个改动，为什么 Coding 会话越长越费劲",
    summary: "文件、命令输出和旧对话会在后续每一轮里反复出现。我怎样控制会话边界，少让无关上下文陪跑。",
    body: efficientCodingAgentSessions,
  },
  {
    slug: "from-completions-to-responses",
    date: "2026-08-16",
    title: "当 API 不再只返回一段话：从 Completions 到 Responses",
    summary: "大模型接口从 prompt 续写，走到带角色的 messages，再走到可携带状态、工具与事件的 response。这三次数据模型变化背后，产品正从文本生成器走向 Agent 运行时。",
    body: fromCompletionsToResponses,
  },
  {
    slug: "agent-room-coordination",
    date: "2026-08-14",
    title: "Agent 一进群就抢话，问题出在房间",
    summary: "多个 Agent 共处一个频道时，@mention 只能压住噪声。系统需要显式处理快照版本、注意力、过期草稿，以及沉默的权利。",
    body: agentRoomCoordination,
  },
  {
    slug: "huawei-a2a-third-party-agent",
    date: "2026-08-13",
    title: "华为怎样把第三方 Agent 接进小艺",
    summary: "第三方 Agent 怎样在小艺开放平台登记，又怎样通过鸿蒙 Agent 通信协议被发现、协同和调用。",
    body: huaweiA2aThirdPartyAgent,
  },
  {
    slug: "agent-plugins-portable-box",
    date: "2026-08-07",
    title: "Skills 和 MCP 之间，缺的是一个可以搬走的盒子",
    summary: "Agent Plugins 1.0.0 没有发明新的 Agent 能力，而是给 Skills 和 MCP 约定了一套可移植的包装格式。这个小规范解决了什么，又刻意不解决什么。",
    body: agentPluginsPortableBox,
  },
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

export const docProjects = [
  {
    slug: "tinybot",
    title: "Tinybot",
    label: "PRIMARY DOCUMENTATION",
    status: "Foundation · Active",
    summary: "Source-backed notes on Tinybot's architecture and engineering tradeoffs.",
    sections: [
      {
        title: "Architecture notes",
        docs: [
          {
            slug: "multi-workspace-project-coordinator",
            title: "Tinybot 怎样协调多个工作目录",
            summary: "协调 Agent 不直接碰文件，而是把任务交给各目录自己的持久化 Thread",
            body: tinybotMultiWorkspaceProjectCoordinator,
          },
          {
            slug: "agent-long-term-memory",
            title: "Agent 长期记忆系统",
            summary: "候选记忆如何从完成 Turn 进入 SQLite，并成为新 Thread 的固定上下文",
            body: tinybotAgentLongTermMemory,
          },
          {
            slug: "agent-loop-persistence",
            title: "Agent Loop 持久化",
            summary: "Checkpoint、Rollout 与重启恢复的边界",
            body: tinybotAgentLoopPersistence,
          },
        ],
      },
    ],
  },
  {
    slug: "virtualhome",
    title: "VirtualHome",
    label: "PROJECT DOCUMENTATION",
    status: "v0.1.0 · Active",
    summary: "A simulation-first guide to the household model, state, and API.",
    sections: [
      {
        title: "Start here",
        docs: [
          { slug: "introduction", title: "Introduction", summary: "Overview and goals", body: introduction },
          { slug: "getting-started", title: "Getting Started", summary: "Install, configure, run", body: gettingStarted },
        ],
      },
      {
        title: "Internals",
        docs: [
          { slug: "architecture", title: "Architecture", summary: "System design and data flow", body: architecture },
          { slug: "data-and-sync", title: "Data & Sync", summary: "Local storage and simulation state", body: dataAndSync },
        ],
      },
      {
        title: "Reference",
        docs: [
          { slug: "api-reference", title: "API Reference", summary: "HTTP API and schemas", body: apiReference },
        ],
      },
    ],
  },
];
