读完华为的[《鸿蒙 Agent 通信协议接入方案》](https://developer.huawei.com/consumer/cn/doc/service/agent2agent-0000002498656261)，我最先想确认的是：小艺究竟把第三方 Agent 当成一个工具，还是把它当成另一个能独立工作的 Agent？

答案更接近后者。第三方保留自己的模型、业务逻辑和云端运行环境，只向小艺开放一个符合鸿蒙 Agent 通信协议的服务端点。小艺负责登记、选择和调用它，也负责把执行状态、追问和结果呈现给用户。

这套做法可以概括成「平台纳管，远程执行」。它兼容 A2A 的任务和消息模型，但没有做成一个完全去中心化、任意 Agent 都能自由发现彼此的网络。

## 整体架构

把云 A2A、端 A2A 和多 Agent 编排放在一起，大致是下面这个结构。控制面决定 Agent 如何进入目录；运行时由小艺或系统 Agent 理解请求、匹配能力、分派任务，再把执行状态和结果收回来。底部两条路径的执行边界不同，但都向编排层提供可追踪的任务或消息状态。

![华为第三方 Agent 接入、系统编排、云 A2A 与端 A2A 调用的整体架构](/images/notes/huawei-a2a-third-party-agent/overall-architecture.webp)

这是一张根据公开资料整理的架构图，不是华为原始设计图。它没有假定云、端之间已经存在对开发者开放的统一路由 API；公开文档目前只确认了两种接入路径，以及系统 Agent、分发 Agent 和任务状态在协同中的职责。

## 引入发生在控制面，调用发生在数据面

华为把接入拆成了两层。

控制面是小艺开放平台。开发者在这里创建 A2A 模式智能体，填写能力描述、API URL、认证方式和会话维持方式，也可以配置输出卡片、关联应用、账号绑定、快捷指令与触发器。开发、调试、审核、上架和多端分发也在平台内完成。华为的[官方活动说明](https://developer.huawei.com/consumer/cn/activity/incentive/ai/)仍把 A2A 定义为三种主要开发模式之一，措辞很明确：直连三方智能体。

数据面是小艺 Agent Client 与第三方 Remote Agent 之间的网络调用。Agent 的推理和业务数据仍在第三方服务器上，小艺按控制面的配置找到端点并发起任务。

![第三方 Agent 通过小艺开放平台登记，由小艺系统 Agent 在运行时调用](/images/notes/huawei-a2a-third-party-agent/control-and-data-plane.webp)

[《鸿蒙智能体框架白皮书》](https://developer.huawei.com/consumer/cn/doc/guidebook/ai-agent-0000002355199797)把能力声明称为「智能体卡」。应用 Agent 通过小艺开放平台声明自己的能力范围，供系统 Agent 和其他生态 Agent 匹配。公开接入页面则要求开发者直接配置 API URL 和认证信息。两处放在一起看，华为实际上用小艺开放平台承担了注册表和治理入口的职责。

我没有在公开资料中找到一个让任意客户端查询全量 Agent、再动态抓取第三方 Agent Card 的开放 Registry API。这里的「发现」更像平台内部的能力匹配，不宜理解成开放互联网里的点对点发现。

## 一次调用怎样完成

鸿蒙 Agent 通信协议统一使用一个 HTTP Endpoint，主体是 JSON-RPC。服务间可以选择有状态或无状态通信。

有状态模式先调用 `initialize`。第三方服务器返回 `agentSessionId` 和有效期，小艺再发送 `notifications/initialized`；后续请求把该值放进 `agent-session-id` Header。无状态模式省略这两步，但每次请求都要重新携带 AK/SK、API Key 或 OAuth 凭据。

真正执行任务时，小艺调用 `message/stream`。请求中有本次任务 ID、对话 `sessionId`、可选的 `agentLoginSessionId`，以及由 `text`、`file`、`data` 组成的消息。`text` 可能是用户原话，也可能只是小艺拆出的一个子任务。

第三方 Agent 通过 SSE 返回两类事件：

- `TaskStatusUpdateEvent` 用来报告 `submitted`、`working`、`input-required`、`completed`、`canceled` 或 `failed` 等状态；
- `TaskArtifactUpdateEvent` 承载文本、文件和结构化结果，也能携带鸿蒙卡片数据、端侧指令、推荐问题与引用信息。

`input-required` 很重要。它说明 Remote Agent 不只是一个一次性函数：信息不足时，它可以要求小艺向用户追问，再继续同一任务。协议也要求第三方服务器按 `sessionId` 保存对话上下文。

![小艺与第三方 Remote Agent 的初始化、流式任务和生命周期控制时序](/images/notes/huawei-a2a-third-party-agent/runtime-sequence.webp)

围绕任务生命周期，华为还定义了 `tasks/cancel`、`clearContext`、`authorize`、`deauthorize` 和 `push`。前两个分别取消任务和清理多轮上下文；授权指令负责把华为账号授权状态交给第三方 Agent；`push` 供音视频、文件生成等长任务在完成后主动回传结果。

这些 RPC 可以在[协议总览的可检索镜像](https://developer.harmonyos.cool/docs/distribute/xiaoyi/agent2agent-0000002498656261/agent2agent-comments-0000002500412353/)中逐项查看。镜像明确声明自己不是华为官方文档，因此我只把它当作动态官网页面的文本索引，协议口径仍以华为链接为准。

## 四个 ID 不要混在一起

接入时最容易混淆的不是消息格式，而是身份和会话。

| 标识 | 谁分配 | 用途 |
| --- | --- | --- |
| AK/SK、OAuth、API Key | 接入双方配置 | 小艺与第三方服务器之间的机器认证 |
| `agent-session-id` | 第三方 Agent Server | 服务器间的协议会话 |
| `sessionId` | 小艺 Agent Client | 一段用户多轮对话的上下文 |
| `agentLoginSessionId` | 第三方 Agent Server | 用户登录第三方业务后的身份凭据 |

服务器认证成功，不代表用户已经登录第三方业务；清除对话上下文，也不等于注销用户账号。这也是华为额外增加 `authorize`、`deauthorize` 和 `clearContext` 的原因。

## 云 A2A 和端 A2A 是两条调用路径

华为现在同时提供云 A2A 和端 A2A。二者都用 Agent Card 描述能力，也都服务于 Agent 之间的任务协作，但接入点并不相同。

| 维度 | 云 A2A | 端 A2A |
| --- | --- | --- |
| 第三方服务放在哪里 | 开发者自己的云端 Agent Server | HarmonyOS 应用中的 `AgentExtensionAbility` 组件 |
| 怎样引入 | 在小艺开放平台配置 API URL、认证和会话模式 | 在 `module.json5` 注册 `type: "agent"` 的可导出组件，并用 metadata 绑定 `agent_config.json` |
| 能力怎样声明 | 平台中的智能体信息和智能体卡 | 随应用打包的 Agent Card，包含 skills、输入输出 MIME、流式、推送、状态历史和设备范围 |
| 调用边界 | HTTPS 上的 JSON-RPC、Streamable HTTP 与 SSE | 系统应用连接组件；服务端在 `onData()` 收数据，经 `AgentHostProxy.sendData()` 返回 |
| 认证 | AK/SK、API Key、OAuth，以及第三方账号授权 | `onAuth()` 接收握手数据，通过 `AgentHostProxy.authorize()` 回应 |
| 生命周期 | `initialize`、`message/stream`、取消、清上下文、Push | `onCreate`、`onConnect`、`onData`、`onAuth`、`onDisconnect`、`onDestroy` |
| 更适合 | 已经在线运行、计算较重、需要跨平台或后台长任务的 Agent | 需要贴近应用进程、设备能力、本地数据或低时延交互的 Agent |

端侧文档有两个容易误读的限制。第一，当前 Ability Kit 指南写的是「系统应用可以连接其他应用实现的 `AgentExtensionAbility`」，不是任意第三方应用都可以扫描并直连其他应用的 Agent。小艺或系统框架仍处在调用入口。第二，「端 A2A」表示 Agent 服务以 HarmonyOS 组件形式在设备侧暴露，并不自动等于模型完全离线运行；组件内部仍可以访问开发者自己的云服务。

![云 A2A 经网络调用远端 Agent，端 A2A 通过 HarmonyOS 组件调用设备内 Agent](/images/notes/huawei-a2a-third-party-agent/cloud-vs-on-device-a2a.webp)

端侧的引入过程也更接近操作系统服务注册。开发者把 Agent 的名称、说明、技能、标签、示例、输入输出类型和设备范围写进 `agent_config.json`。其中 `skills[].id` 可精确指定技能，`tags` 和 `examples` 可用于检索或匹配，`appInfo.deviceTypes` 与最低应用版本帮助系统定位可运行的组件实例。运行时再由组件处理连接、数据与认证。

官方文档目录里还能看到 `AgentAbilityExtension` 的名称，它出现在较新的 Agent Framework Kit 条目中；Ability Kit 的 API version 24 指南使用的是 `AgentExtensionAbility`。现阶段不应把两个名字直接当成可互换 API，落地时要以项目所用 SDK 版本和 Kit 的接口说明为准。

## 多 Agent 协同主要由小艺编排

白皮书描述了三种协同方式。

主从模式下，小艺拆分请求，把子任务分别交给应用 Agent，最后融合结果。对等协商模式由分发 Agent 选择协作 Agent；协作失败时可以收回请求并改派。任务订阅模式依赖时间、地点和事件触发，在条件满足时调用指定 Agent。

这些是编排策略。A2A 协议负责传任务、报状态、追问、取消和返回结果，并不替系统 Agent 决定该选谁、怎样拆任务或怎样合并答案。结合云端协议和端侧组件文档，可以把华为目前公开的编排技术点拆成五段：

1. **能力登记**：云 Agent 在小艺开放平台登记，端 Agent 通过应用内 Agent Card 声明 skills、输入输出和设备约束。
2. **能力匹配**：系统根据意图、能力描述、标签、示例和当前设备条件选择候选 Agent。公开资料确认了这些描述字段的存在，但没有公开排序模型、打分公式或全量 Registry 查询接口。
3. **任务路由**：主从模式由小艺拆子任务；对等模式把选择权交给分发 Agent；订阅模式由系统事件触发。从两条接入路径推断，候选执行方可以落在云端 Remote Agent 或设备内 Agent 组件，但公开文档没有确认统一的跨端选路机制，也没有给开发者编写跨端路由规则的 DSL。
4. **执行控制**：云侧靠 Task 状态、`input-required`、取消、上下文和 Push 管理长任务；端侧靠组件连接、收发数据和认证回调承接调用。协议层为编排器提供可观察的任务状态。
5. **结果收口**：主从模式明确由小艺汇总子任务结果；对等模式可以由协作 Agent 直接返回，也可以把控制权交回分发 Agent。卡片、文本、文件和结构化 Artifact 是收口时可用的结果载体。

因此，可以确认华为有「系统 Agent/分发 Agent 负责调度，第三方 Agent 负责执行」的编排模型，也公开了支撑编排的能力卡、任务状态和三类协同模式。尚未公开的是更底层的工程细节，例如候选 Agent 如何评分、多个子任务是否并行、超时和重试策略、结果冲突怎样裁决，以及开发者能否在控制台画出跨多个第三方 Agent 的 DAG。

这里还有一处产品口径差异。白皮书曾把「多 Agent 模式」列为独立开发模式；当前公开的激励和上架说明主要列出 LLM、Workflow、A2A 三类。可以确认的是华为已经设计了多 Agent 协同架构，不能据此断言普通开发者已经可以在控制台任意编排多个第三方 Agent。

## 它与标准 A2A 兼容，但不是原样照搬

华为复用了标准 A2A 的核心概念：Agent Card、Task、Message、Part、Artifact、任务状态、流式事件和取消任务。华为文档里的 `message/stream`、SSE、`TaskStatusUpdateEvent` 与 `TaskArtifactUpdateEvent`，也能在 A2A 的历史 JSON-RPC 绑定中找到对应结构。

不过，[A2A 最新规范](https://a2a-protocol.org/latest/specification/)已经把数据模型、操作和 JSON-RPC、gRPC、HTTP+JSON 绑定分层，并调整了部分方法命名。`initialize`、`clearContext`、`authorize`、`deauthorize`、华为账号登录会话、鸿蒙卡片与设备上下文，都不是标准 A2A 的通用原语。

所以「兼容」应理解为共享任务语义和传输骨架，而不是任意最新版 A2A Server 填一个 URL 就能零改造接入。已有 A2A Agent 通常需要一层华为适配器，至少处理初始化、会话、账号授权和鸿蒙扩展数据。华为文档沿用的 `message/stream` 形式更接近 A2A 0.2/0.3 时代的 JSON-RPC 绑定；接入前应按华为当前报文测试，不能只拿最新版 A2A SDK 猜兼容性。

## 我会怎样评估一次接入

如果要把现有 Agent 接入小艺，我会先确认这些问题：

1. 服务端能否实现华为要求的单 Endpoint、初始化和 `message/stream` SSE；
2. `sessionId`、协议会话和用户登录会话是否隔离，清理行为是否真的删除对应上下文；
3. 任务是否正确处理追问、取消、断连和最终 `final` 状态；
4. 标准 A2A SDK 外面需要补哪些华为扩展；
5. 哪些数据会被小艺传入，哪些敏感操作必须回到端侧让用户确认；
6. 长任务是维持流式连接，还是改走 Push/Webhook。
7. 需求更适合调用云端 Remote Agent，还是做成设备内的 `AgentExtensionAbility`；如果两者都要支持，谁负责跨端选路和降级。

我对这套方案的判断是：它不是把第三方 Agent 搬进华为云，而是把第三方 Agent 纳入小艺的目录、身份和任务系统。开发者保留执行权，华为掌握入口、选择、系统权限和用户体验。这种边界很适合终端平台，也意味着真正的兼容工作集中在协议之外的那一圈：账号、上下文、卡片、端侧工具与审核。

复核日期：2026-08-13。主要依据为华为官方协议页、鸿蒙智能体框架白皮书、小艺开放平台、[HarmonyOS AI 总览](https://developer.huawei.com/consumer/cn/harmonyos-ai)、[端侧 A2A 概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/agent-overview)、[AgentExtensionAbility 开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/agent-extension-ability)与[配置说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/agent-extension-configuration)；标准协议对照使用 A2A Protocol Working Group 发布的最新规范。端侧官方页面依赖动态渲染，我另外用带非官方声明的文档镜像复核了字段与示例，结论仍以华为官网和实际 SDK 为准。
