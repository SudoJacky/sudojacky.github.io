这篇文章对着 Tinybot 当前的 `src/agent_graphs.rs`、`src/graph_runs.rs` 和 Agent Runtime 调用链来写。

先把名字说准：Tinybot 的 Agent Graph 不是一个并行 DAG 调度器。它是带模型路由和受控回环的单游标执行器。一次 Run 始终只走一条路径，节点之间传递一段文本；Agent 节点负责真正干活，Router 决定下一步走哪条边。

这个边界很重要。图负责安排工作，Agent Loop 仍然负责模型、工具、历史和持久化 Thread。Tinybot 没有为了 Graph 再实现一套 Agent Runtime。

## 整体结构

![Agent Graph 分为 definition、单游标 Graph Run 和 Agent Runtime 三层，Run 通过计划与 Turn 串联两侧](/images/docs/tinybot/agent-graph/agent-graph-layers-v1.webp)

Graph definition、Graph Run 和 Agent Thread 是三个不同对象：

| 对象 | 保存位置 | 保存什么 |
| --- | --- | --- |
| Graph definition | workspace 下的 `.tinybot/graphs/<graphId>.json` | 节点、边、节点配置和画布位置 |
| Graph Run | 应用 data root 下的 `graph-runs/<graphId>/<runId>.json` | 某次输入、定义 revision、节点执行记录和终态 |
| Agent Thread | Tinybot 原有的 canonical Thread/Rollout | Agent 节点的对话、工具调用和最终回答 |

definition 属于 workspace，Run 属于应用运行数据，Agent 的完整工作痕迹则继续留在 Thread 系统里。Run 文件只引用 `threadId`，不会复制整段对话。

## 四种节点，只有两种会执行工作

Graph schema 是 `tinybot.agent_graph.v1`，目前有四种节点：

| `kind` | 运行时角色 | 配置 |
| --- | --- | --- |
| `input` | 接收本次 Run 临时传入的文本 | 无 |
| `agent` | 在指定 workspace 创建或复用 Thread，执行一个正常 Agent Turn | `workspacePath`、`instructions`，可选 `model` |
| `condition` | 调用一次 Router 模型，从预先定义的 routes 中选一个 | 可选 `task`、`model`，以及至少两条 routes |
| `output` | 把当前文本写入 `Run.output` | 无 |

节点的 `position` 只服务于画布布局，执行器不读取坐标。Input 也不保存 prompt；旧 definition 如果还带着 Input `config.prompt`，加载时会丢弃，下一次保存后不再出现。真正的输入属于一次 Run，而不是图本身。

下面这张图符合当前执行模型：调查 Agent 先处理输入，Router 判断证据是否够用；不够就交给补充证据 Agent，再回到原调查节点。证据充足时结束。

![单次 Graph Run 从 Input 进入 Agent 和 Router；Router 选择补充证据分支后回到旧 Agent Thread，完成分支在本轮不执行](/images/docs/tinybot/agent-graph/single-cursor-run-v1.webp)

Condition 在 definition 里叫 `condition`，进入运行计划后叫 Router。两者指的是同一种节点。

## 保存时校验结构，运行前校验可执行性

Tinybot 没有把所有规则挤在一层里。

`agent_graphs.rs` 先检查 definition 本身：

- schema version、Graph ID 和名称是否合法；
- 恰好有一个 Input 和一个 Output；
- 节点 ID、边 ID 不能重复，边的端点必须存在；
- Output 不能有出边，Input 不能有入边，边不能指回自己；
- Agent 必须有 workspace，模型与 provider ID 不能是空字符串；
- 配置过的 Condition 至少有两条 route，每条 route 都有稳定 ID、label 和 description；
- Router 的每条 route 必须恰好对应一条带 `sourceRouteId` 的出边。

`graph_runs.rs` 在开始执行前再把 definition 编译成 `AgentGraphPlan`。这一层关心的是图能不能按当前运行器的方式走：

- Input 必须是零入边、一出边；
- Agent 必须至少有一条入边，但只能有一条出边；
- Router 可以有一条或多条入边，每条 route 恰好有一条出边；
- Output 至少有一条入边，不能有出边；
- 所有节点都能从 Input 到达，而且从任何节点最终都能到达 Output；
- 普通节点不能分叉，分叉只能由 Router 完成。

这两层校验解释了为什么它仍叫 Graph，却按单游标运行。图可以有多个候选分支，但每次走到 Router 只选择其中一条，不会同时启动几条支线。

### 回环必须由 Router 控制

运行计划使用强连通分量检查 cycle。每个包含回环的分量都必须满足两个条件：里面至少有一个 Router，并且其中某个 Router 有一条 route 能离开这个回环。

这只能证明图上存在退出路线，不能保证模型最终会选它。为防止 Router 一直要求返工，一次 Run 最多执行 64 个 Agent 或 Router 节点。到达上限后，Run 以 `failed` 结束。

## 一次 Run 怎样向前推进

`graph_runs::start` 的核心状态其实很少：

```text
current_input = 本次 Run 输入
cursor = Input 的唯一后继

while cursor 不是 Output:
    执行 Agent 或 Router
    current_input = Agent 的 finalContent，或保持不变
    cursor = 唯一出边，或 Router 选中的出边

Run.output = current_input
```

Input 和 Output 不产生 `nodeRun`。Agent 与 Router 每次开始前都会追加一条 `running` 的节点记录并立刻写盘，结束后再更新为 `completed`、`failed` 或 `cancelled`。

这里没有独立的 Graph state bag，也没有结构化的端口。一个 Agent 的 `finalContent` 会原样成为下一个 Agent 的用户消息，也会成为 Router 的分类输入。即使图里没有 Agent，`Input -> Output` 也合法，此时输出就是本次输入。

## Agent 节点复用 Tinybot 的标准执行链

Agent 节点第一次运行时，Graph Run 会创建一个普通、可见、可持久化的 Thread：

```json
{
  "source": "agent_graph",
  "title": "<graph name> · <node id>",
  "metadata": {
    "workingDirectory": "<canonical workspace path>",
    "extra": {
      "graphId": "...",
      "graphRevision": "sha256:...",
      "graphRunId": "...",
      "graphNodeId": "...",
      "nodeRunId": "..."
    }
  }
}
```

这个 Thread 没有 `parentThreadId`。Graph 归属通过 metadata 表达，而不是塞进普通 Thread 的父子关系。

随后，执行器调用 `execute_thread_turn_with_services`。节点输入是一条正常的 user message；节点的 `instructions` 被放进 Turn spec 的 `agentRole`，可选的 model、provider 和 reasoning effort 也作为本 Turn 的覆盖项。没有显式覆盖时，节点沿用应用当前配置。

因此，Agent 节点会经过原有的 history hydration、instruction composition、工具调用、trace 和 Rollout 持久化。节点指向另一个 workspace 时，该 Turn 会按自己的工作目录合并项目 MCP 配置，不会错误继承 Graph 发起方的 workspace 配置。

Agent 必须以 `final_response` 停止并返回 `finalContent`。等待表单、运行错误或缺少最终文本都会让当前节点和整个 Run 失败。

### 回到同一个 Agent 时复用 Thread

如果 Router 把游标送回一个已经执行过的 Agent 节点，Run 会复用这个节点最近一次使用的 Thread，而不是创建新 Thread。新的 `current_input` 作为下一条用户消息追加进去。

这样做保留了返工上下文。例如调查 Agent 第二次进入时，还能看到自己上一次的结论和工具结果。代价是回环越长，节点 Thread 的历史也越长。复用范围只在当前 Run 内；下一次 Run 仍会创建新的节点 Thread。

## Router 是一次受限的模型分类

Router 没有进入 Agent Loop，也不创建 Thread。`agent/router.rs` 直接发起一次非流式、无工具的 provider 请求。System prompt 列出 route label 和 description，并把它们编码成 `ROUTE_A`、`ROUTE_B` 这类 token。模型只能返回一个完整 token，`I choose ROUTE_B` 也会被当成无效响应。

执行器再把 token 映射回 definition 中稳定的 route ID，沿带有相同 `sourceRouteId` 的边继续。Run 会记录：

- 模型原始响应；
- 选中的 route ID；
- 选中的 edge ID；
- provider 返回的 usage，如果存在。

Router prompt 明确把输入当作数据，不执行其中的指令。它能减少输入文本对路由指令的干扰，但并不等于通用的 prompt injection 防护。

Router 可以单独覆盖 model、provider 和 reasoning effort；没有覆盖时使用当前激活的 provider profile。它不带工具，也不执行 route 对应的任务，只做选择。

## Definition 用 revision 固定，Run 不追随最新编辑

Graph 文件保存在：

```text
<workspace>/.tinybot/graphs/<graphId>.json
```

Graph ID 只允许字母、数字、连字符和下划线，存储目录还会经过 canonical path containment 检查。保存使用原子替换，读取内容的 SHA-256 则成为 `revision`。

更新和删除都要提交调用方读到的 revision。文件已被别人修改时，操作会得到 revision conflict，不会静默覆盖。开始 Run 也必须带 `graphRevision`；后端会重新读取 definition，并确认当前字节仍对应这版 revision。

revision 还会绑定到 Graph 工具。一个 Turn 发现工具时，工具执行目标已经固定为：

```text
definition workspace + graph id + graph revision
```

如果 Graph 在“工具被发现”和“工具被调用”之间发生修改，调用失败，不会偷偷改跑新版本。

管理列表采用严格读取：目录里有一个坏 definition，列表就报错。工具发现则会跳过坏文件、记录 `agent_graph_tool_discovery_skipped`，并把 diagnostics 返回给工具目录。这样一个损坏的 Graph 不会阻断普通 Agent Turn，同时管理界面仍会看到真实错误。

## Graph 本身也可以成为 Agent 工具

普通 Turn 有明确 working directory 时，Provider Loop 会发现该 workspace 保存的 Graph，并为每一张图注册一个 deferred tool：

```text
agent_graph.run.<graphId>
```

模型能提交的参数只有：

```json
{ "input": "交给这张 Graph 的文本" }
```

Graph ID、workspace 和 revision 都藏在受信任的 execution target 中，模型不能在参数里改掉它们。异步 tool dispatcher 启动 Run，等待整张图结束，然后只把最终输出作为下一轮模型可见的 tool observation。完整 Run 和节点 Thread 仍保存在本地，父 Agent 不需要吞下所有中间记录。

Graph 创建的 Agent 节点不会再次获得 Agent Graph 工具。Provider Loop 通过 `graphRunId` metadata 识别这种 Turn，并跳过 Graph tool contributor。这条规则阻止 Graph 节点递归启动另一张 Graph，也避免图意外调用自己。

如果父 Turn 被取消，取消信号会传给正在执行的 Graph Run。活跃 Agent 节点的 Turn 会收到 cancel，执行器等待它完成清理，再把节点和 Run 标为 `cancelled`。Router 请求也在取消边界内等待。

## Run 持久化是执行记录，不是断点续跑

Run 使用 schema `tinybot.agent_graph_run.v1`，每次状态变化都原子重写：

```text
<data root>/graph-runs/<graphId>/<runId>.json
```

![Graph definition 以 revision 固定 Graph Run，Run 再通过 threadId 指向保存节点完整历史的 canonical Thread](/images/docs/tinybot/agent-graph/persistence-surfaces-v1.webp)

顶层记录 definition workspace、Graph revision、原始输入、Run 状态、输出或错误；`nodeRuns` 记录每次经过的节点、Thread ID、Router 决策和节点错误。历史列表还会按 definition workspace 过滤，因此不同 workspace 中同名的 Graph 不会混在一个列表里。

但当前源码没有 Graph Run 的启动恢复路径。进程如果在节点执行中退出，已经落盘的 Run 可能一直保持 `running`；系统不会根据最后一个 `nodeRun` 自动重放，也没有 `interrupted` 状态。每节点写盘目前用于观察和追查，不应被理解为 workflow checkpoint。

自动恢复还会遇到外部副作用问题。节点 Thread 里的 Shell、MCP 或文件操作可能已经完成，仅靠 Run JSON 无法安全判断该不该重做。真要加入恢复，需要先定义节点幂等、活动 Turn 对账和终态修复，而不是简单地把 `cursor` 重新设回最后一个节点。

删除 definition 也不会级联删除旧 Run 或节点 Thread。它们是已经发生过的执行记录。

## 当前实现的取舍

| 选择 | 得到什么 | 暂时不支持什么 |
| --- | --- | --- |
| 单游标 + 文本传递 | 执行状态小，能直接接现有 Agent Loop | 并行 fan-out、join、结构化端口 |
| Router 独占分叉 | 每次路径选择都有明确记录 | 普通 Agent 节点并行启动多个后继 |
| Router 控制回环 + 64 次上限 | 能表达审核返工，也能拦住无限循环 | 基于次数、成本或业务状态的精细终止条件 |
| 每个 Agent 节点使用标准 Thread | 工具、历史、Rollout 和 UI 都能复用 | 轻量、无会话的函数式节点 |
| definition revision 固定 Run | 一次执行不会中途换图 | 自动追随最新 Graph 编辑 |
| 原子 Run 快照 | 状态容易读取，失败位置可追查 | 崩溃后续跑和事件级审计日志 |

所以，Tinybot 现在的 Agent Graph 更接近“可视化编排的一条 Agent 工作路径”。它已经覆盖顺序处理、模型分流和审核返工，也刻意没有把并行调度、汇合语义和分布式恢复塞进 V1。

## 源码入口

- `src/agent_graphs.rs`：definition schema、校验、workspace 存储、revision 和工具发现。
- `src/graph_runs.rs`：运行计划、拓扑校验、单游标执行、节点 Thread 和 Run 持久化。
- `src/agent/router.rs`：Router prompt、provider 请求与严格 route token 解析。
- `src/tools/registry/contributors.rs`：把 workspace Graph 注册成 deferred tool，并绑定 workspace、ID 和 revision。
- `src/agent/runtime/provider_loop.rs`：普通 Turn 的 Graph 工具发现，以及 Graph 节点的递归抑制。
- `src/agent/bridge/tool_dispatcher.rs`：异步启动 Graph Run、传递取消信号并把最终输出投影为工具结果。
- `src/desktop_commands/agent_graphs.rs`：definition 的 Tauri 命令边界。
- `src/desktop_commands/graph_runs.rs`：Run 列表与直接启动命令。
