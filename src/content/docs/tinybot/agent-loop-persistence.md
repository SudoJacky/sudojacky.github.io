这篇文章只谈当前代码。Tinybot 的 Agent Loop 会保存可重放的历史和少数几个恢复点，但不会保存任意执行位置。

## Tinybot 实际保存了什么

持久化边界比“保存整个 Agent Loop”窄得多：

- 运行中的细粒度 checkpoint 保存在内存里；
- 完成的消息、推理和工具结果持续写入 append-only Rollout；
- 需要等待用户输入时，保存可以跨进程恢复的 Turn checkpoint；
- 进程重启后，仍处于 `Running` 的 Turn 会被标记为 `interrupted`，而不是从任意一行代码继续执行；
- 上下文压缩采用“先持久化、再替换运行时历史”的顺序。

模型或工具执行到一半时如果进程崩溃，这个 Turn 不会从断点接上。下次启动时，它会变成 `interrupted`。

## 责任边界

相关代码分在五个模块里。先看它们之间的关系：

```text
agent/runtime
    执行模型与工具循环，产生 checkpoint 和 runtime event
          │
          ▼
agent/bridge
    把运行时接到 Thread、Rollout、实时 UI 和桌面能力
          │
          ▼
threads/rollout/store
    追加 canonical JSONL，重建 Turn、消息和 checkpoint
          │
          ├──► threads/domain
          │      内存中的类型化 Thread 投影
          │
          └──► state.sqlite
                 可重建的查询索引

runtime/lifecycle
    启动时检查索引、重建投影并处理遗留 Turn
```

`agent/runtime` 不直接依赖 Tauri，也不认识某一种数据库。它只使用 checkpoint store、trace sink 和 context checkpoint committer 等注入接口。`agent/bridge` 再把这些接口接到 Tinybot 的 Thread 系统。

持久化事实源位于：

```text
.tinybot/threads/<year>/<month>/<day>/thread-*.jsonl
```

`.tinybot/state/state.sqlite` 用于列表、查询和启动恢复。它可以从 JSONL Rollout 重建；两者不一致时，以 Rollout 为准。

## 三种 checkpoint

源码里都叫 checkpoint，实际做的是三件不同的事。本文固定使用下面三个名称：

| 名称 | 保存位置 | 产生时机 | 跨进程恢复 |
| --- | --- | --- | --- |
| Loop checkpoint | 默认在进程内存中 | 模型调用前、工具执行前后、等待和取消等 phase 边界 | 否 |
| Turn checkpoint | canonical Rollout | Loop 返回一个需要保留的恢复边界，目前最完整的路径是 `awaiting_form` | 是 |
| Context checkpoint | canonical Rollout | 模型上下文需要压缩时 | 恢复上下文，不恢复执行位置 |

### Loop checkpoint

Loop checkpoint 记录当前 `phase`、iteration、消息、待执行工具、已完成工具结果、激活工具和 resume token。

Runtime 会在模型调用和工具执行的阶段边界更新它。桌面端默认使用内存实现，并按 `sessionId + turnId` 隔离不同 Turn。这足以支持同一进程内的暂停和继续，进程退出后数据也随之消失。

所以，代码里频繁出现 `save_phase_checkpoint`，不等于频繁写磁盘。

### Turn checkpoint

当 `request_user_input` 工具需要显示表单时，Loop 会：

1. 把 phase 切换为 `awaiting_form`；
2. 保存表单、消息、待执行工具和已完成结果；
3. 生成与表单关联的 resume token；
4. 返回 `stopReason: awaiting_form`。

Bridge 等 runtime event 刷新完，再通过 `thread.turn.set_checkpoint` 把 checkpoint 写入 Rollout。`agent.checkpoint` 只是 runtime trace 中的临时事件；恢复时读取的是显式写入的 Turn checkpoint。

用户提交表单后，Continuation 路径从 Rollout 读取 checkpoint，校验 phase 和 `formId`，再把它放回内存 checkpoint store。Loop 沿用原来的 Turn 身份，把表单结果转换成那次工具调用的结果，然后继续执行。

恢复的是原 Turn，不是一个带着相似上下文的新 Turn。

### Context checkpoint

Context checkpoint 不记录执行位置。它保存压缩后的对话历史，让后续模型调用从这份历史继续。

它采用 write-ahead 顺序：

```text
计算 replacement history
        │
        ▼
校验 context lineage
        │
        ▼
追加 Compacted 记录并确认 Rollout 可读
        │
        ▼
同步可重建索引
        │
        ▼
安装到正在运行的模型上下文
```

提交时同时使用进程内锁和跨进程文件锁。同一个 `contextId` 重复提交相同内容是幂等操作。相同 ID 对应不同内容，或者再次提交已经被后续 checkpoint 取代的历史 ID，都会报错。

Runtime 要等 canonical Rollout 写入成功，并且重新读到刚写入的内容，才会安装压缩历史。此后即使 SQLite 索引同步失败，事实源里仍有完整记录，系统可以报告索引降级。Rollout 写入失败时，当前 Turn 直接失败。

## 一个 Turn 怎样落盘

一次正常执行按下面的顺序落盘：

```text
持久化 TurnStarted
        │
        ▼
恢复历史并启动 Agent Loop
        │
        ├── runtime event ──► 实时 UI
        │
        └── semantic event ─► 持久化缓冲区 ─► Rollout
        │
        ▼
刷新剩余 semantic event
        │
        ▼
写入 completed / failed / cancelled / interrupted
        │
        ▼
如结果携带 checkpoint，再处理对应 checkpoint
```

Turn start 在第一次 provider 调用前写入。即使后面的历史恢复、模型调用或工具执行失败，启动恢复仍能找到这个未完成 Turn。

Loop 结束后，Bridge 先刷新 trace sink。只要 semantic event 没有刷入 Rollout，即使 Runtime 已经返回成功，Bridge 仍会把整个 Turn 判为失败。

## 实时事件与持久化事件

Runtime event 有两个去处：

- 实时通道把流式文字和执行进度发给 UI；
- 持久化通道记录完整消息、推理、工具调用和工具结果。

流式 delta、普通 phase 变化和非阻塞状态主要留在实时通道，完成后的语义事件才进入 durable sink。JSONL 不必记录每个 token，模型下一轮需要的完整上下文仍然可以从 Rollout 重建。

普通语义事件采用有界缓冲：

- 队列容量为 2048；
- 最多 64 个事件组成一个批次；
- 最长等待 50 ms；
- 工具结果、错误、取消等边界会触发同步刷新；
- Turn 或 Continuation 退出前会再次显式刷新。

持久化 worker 出错后会记住第一次错误，并拒绝后续写入。这个错误会一路返回到 Turn 调用方。

## 重启后的恢复规则

启动时，Tinybot 先检查 SQLite 索引，从 canonical Rollout 重建 Thread 投影，再处理遗留状态。

| 重启前状态 | 是否有 Turn checkpoint | 启动后的处理 |
| --- | --- | --- |
| `Running` | 任意 | 标记为 `interrupted` |
| `Waiting` | 有 | 保留为 resumable |
| `Waiting` | 无 | 标记为 awaiting interaction |
| `Completed` / `Failed` / `Cancelled` / `Interrupted` | 任意 | 保持终态 |

resumable 只表示恢复所需的数据还在，不会在启动后自动执行。表单仍要等用户提交或取消，Continuation 路径才会重新进入 Loop。

## 为什么不恢复任意执行位置

难点不是把内存状态序列化下来，而是确认上一步到底有没有发生。Agent Loop 会触发不少外部副作用：

- Shell 命令可能已经修改文件；
- 工具调用可能已经写入数据库；
- HTTP 请求可能已经被远端接受；
- 子 Agent 可能已经开始工作；
- 模型请求可能已经计费，但结果还未落入本地状态。

只根据最后一个 checkpoint 重新执行，可能再次触发这些操作。安全恢复需要每一种工具都有稳定的幂等键，还要能查询远端是否已经提交；现有恢复链路没有依赖这样的统一保证。

Tinybot 当前只恢复 `awaiting_form` 这类已经停住、没有未决外部执行的边界。重启会中断仍在运行的 Turn，已经落盘的 semantic event、工具结果和上下文则继续保留。

我更愿意把它叫作保守的故障模型。源码没有直接写明“这样做是为了避免重复副作用”，但从恢复规则看，这是最合理的解释。这里属于设计推断，不是代码中的显式约束。

## 主要取舍

### Append-only Rollout 与 SQLite 状态库

Append-only JSONL 可以审计和重放，也避免同时维护两套权威状态。相应地，读取要经过 replay，日志会持续增长，格式升级还得照顾旧数据。

SQLite 承担常用查询，但只是派生索引。索引损坏不会改写历史记录，不过系统需要额外的启动检查和修复流程。

### 批量持久化与即时持久化

每个 runtime event 都同步刷盘会让磁盘延迟拖慢整个 Loop。现在的做法是最多积累 64 条或等待 50 ms，遇到工具结果、错误和退出等 durability barrier 再立即刷新。

### 丰富的实时事件与稳定的持久化语义

UI 需要细粒度进度，恢复需要的是完整语义。两条通道分开以后，新增一种进度状态不必同时升级长期存储格式。

调试时则要分清 live trace、durable semantic event 和 Rollout 重建出的 ThreadItem。三者看起来相近，生命周期并不相同。

### Context write-ahead 与可用性

“先持久化再安装”让运行时和磁盘使用同一份压缩历史。如果 compaction 无法落盘，当前 Turn 会失败，不会继续使用只存在于内存中的结果。

## 仍需确认的语义

### 终态 checkpoint

写入终态时，Rollout 会清理此前的 Turn checkpoint。Bridge 随后还会处理 runtime result 中携带的 checkpoint，而取消结果恰好包含一个 `phase: cancelled` 的 checkpoint。最终，一个已经结束的 Turn 仍可能带有 checkpoint。

恢复查询只接受 `Running` 或 `Waiting` Turn，因此不会拿这个 checkpoint 续跑。这里还缺一个明确的产品决定：

- 如果用于诊断，应正式命名为终态诊断快照，并与 resumable checkpoint 区分；
- 如果坚持“终态不保留 checkpoint”的不变量，则应调整 Bridge 的写入顺序或过滤规则。

决定下来之前，不能把“所有 terminal 状态都会删除 checkpoint”写成系统不变量。

### Turn start 与历史恢复顺序

Bridge 当前先持久化 Turn start，再从 Thread 恢复 runtime history。历史恢复即使失败，也会留下一个能被启动恢复找到的 Turn。

这个顺序方便追查早期失败，但恢复失败路径必须结束该 Turn，或者留给下次启动标记为 `interrupted`。内部模块说明目前应跟着实际代码调整。

## 源码入口

- `src/agent/runtime/provider_loop.rs`：模型循环、phase checkpoint、context compaction。
- `src/agent/runtime/user_input.rs`：表单 checkpoint 和 continuation 状态恢复。
- `src/agent/runtime/stores.rs`：默认内存 checkpoint store。
- `src/agent/bridge/agent_flow.rs`：Turn 启动、trace flush 和终态持久化顺序。
- `src/agent/bridge/persistence.rs`：Turn 与 checkpoint 的 RPC 写入。
- `src/agent/bridge/trace_sink.rs`：实时/持久化事件分流和批量刷新。
- `src/agent/bridge/webui_continuation.rs`：从 durable checkpoint 恢复表单 Turn。
- `src/threads/rollout/store/turn.rs`：Turn 事件、checkpoint 与启动恢复。
- `src/threads/rollout/store/mod.rs`：Context checkpoint 和索引一致性。
- `src/runtime/lifecycle.rs`：进程启动恢复。
