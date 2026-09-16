之前写[从 Completions 到 Responses](#/notes/from-completions-to-responses)时，我关心的是一次模型调用怎样开始表达工具、状态和执行过程。读 OpenAI 的 [Agents API 文档](https://developers.openai.com/api/docs/guides/agents-api/overview)，这个问题又往前走了一步：应用可以把持续运行 Agent 的那层框架也交给平台。

假设要做一个排查 Bug 的助手。用户贴进报错，它读取项目，复现问题，修改文件，运行测试；做到一半，用户补充「先别改公共接口」。这里需要的已经超过一次回答。谁继续调用模型，谁把工具结果送回去，上下文满了怎么办，浏览器断线后到哪里找进度，这些都要有人负责。

Agents API 提供的是 OpenAI 托管的 Codex harness。Harness 可以理解为围绕模型运转的执行框架：安排模型与工具的循环、维护会话、压缩上下文，并在需要时协调子 Agent。应用提交任务，提供工具，选择执行环境，再通过事件和保存下来的记录接回工作结果。

本文依据 2026 年 9 月 16 日查阅的官方文档整理。当前接口使用 `beta.agents` 和 `OpenAI-Beta: agents=v1`。下面的场景是解释用例，代码依据官方示例改写，未做线上 API 实测。

## 先分清 Agents API、Agents SDK 和 Responses

三个名字经常一起出现，选择时我会先问：Agent 的循环在哪里运行，由谁保存和衔接工作？

| 入口 | 循环由谁负责 | 应用主要接入什么 |
| --- | --- | --- |
| Responses API | 应用控制调用流程，也可使用托管工具和状态能力 | 模型响应、工具调用与结果 |
| Agents SDK | SDK 的 runner 在应用的运行环境里执行 | 自定义 Agent、工具、handoff 与自己的部署和存储 |
| Agents API | OpenAI 托管 Codex harness | 持续会话、输入事件、执行进度与产物 |

这是[官方运行时对比](https://developers.openai.com/api/docs/guides/agents#compare-agent-runtimes)里的职责划分。Responses 已经支持工具和对话状态，不能把它概括成无状态文本接口。Agents SDK 也会替开发者执行循环，只是这段程序由自己的应用运行。

Agents API 进一步托管了运行框架。对于需要反复读文件、执行命令、根据结果继续工作的任务，它减少了应用要维护的循环和会话基础设施。代价是运行时的行为和生命周期更多地依赖平台。如果产品的重点恰好是研究自己的调度、上下文策略或跨模型执行方式，保留这部分控制权仍然有价值。

## Harness 和执行环境可以分开

读[架构文档](https://developers.openai.com/api/docs/guides/agents-api/architecture)时，最值得停一下的是 harness 与 environment 的区别。

Harness 决定下一步怎样调用模型和工具，environment 提供命令执行与文件操作的位置。前者由 OpenAI 运行；后者可以选 OpenAI 的沙箱，也可以接自己的机器，或者完全不配置。

![应用向 OpenAI 托管的运行框架提交任务并接收事件；框架向可选执行环境发送命令，环境可以由 OpenAI 或应用自己托管](/images/notes/openai-agents-api-managed-runtime/managed-harness.webp)

图里的左侧是自己的产品，中间是 OpenAI 运行的 harness，右侧才是处理文件和执行命令的工作区。中间标记的 Memory 指会话与上下文管理，不代表应用已经获得一套跨会话的长期记忆系统。

| 环境选项 | 适合的工作 | 需要自己承担的部分 |
| --- | --- | --- |
| `none` | 问答、远程 MCP、应用函数调用 | 函数处理器；没有内置 Bash、文件工作区或执行器 MCP |
| `openai_hosted` | 跑脚本、修改文件、生成报告 | 配置依赖、输入文件和网络访问，取回结果 |
| `self_hosted` | 访问自己的计算资源、私有网络或特殊软件 | 准备环境，接入执行器，管理连接、关闭和文件保存 |

自托管模式尤其容易被名字误导。官方方案是在自己的环境运行 `codex exec-server`，由它主动连接平台，接收命令并交回结果。模型与工具循环仍由 OpenAI 的 harness 管理，不能据此推断所有任务数据都留在本机。[自托管指南](https://developers.openai.com/api/docs/guides/agents-api/environments/self-hosted)还要求把应用 API key 留在沙箱外，执行器使用权限受限的独立环境密钥。

## 沿着一次任务看 Session 和 Turn

接入时先区分几个对象，会比直接照着示例填字段容易理解。

Agent 保存模型、指令、工具等配置，可以复用。Session 是带着这份配置工作的具体会话，保存对话与执行记录。Turn 是会话里的一轮工作，它可能包含多次模型调用和工具执行。Events 报告实时变化，Items 则是之后可以查询的消息与工具调用记录。[配置指南](https://developers.openai.com/api/docs/guides/agents-api/configuration)和[会话指南](https://developers.openai.com/api/docs/guides/agents-api/sessions)分别说明了这些对象的关系。

以「分析一份文件并生成报告」为例：

1. 应用创建 Session，给出 Agent 配置、环境和初始任务。
2. 如果使用托管沙箱，平台准备依赖与文件；环境就绪后开始工作。
3. Harness 调用模型，安排工具执行，把结果带回后续推理，应用同时接收进度事件。
4. Agent 完成当前 Turn，应用检查执行结果，再展示报告或失败原因。
5. 用户要求「按地区再拆一下」时，应用向同一个 Session 发送输入，继续这段工作。

第五步还有一个时间差异：会话空闲时，新消息启动下一轮；正在工作时，新消息会引导当前轮。用户补充约束，不必总被转换成一次全新的任务。

这也解释了为什么要保存 `session_id`。应用里的会话需要对应到平台上的 Session；刷新页面后，才能找到原来的记录与状态。复用一个 Agent 配置并不会让它的所有 Session 自动共用对话。

## 一个小例子：创建会话并观察它工作

下面把[官方 quickstart](https://developers.openai.com/api/docs/guides/agents-api/quickstart)改成生成一个演示文件。它适合观察协议，不是一份包含存储、重连和错误处理的完整服务端实现。

```python
from openai import OpenAI

with OpenAI() as client:
    with client.beta.agents.sessions.create(
        agent={
            "model": "gpt-6-astra",
            "instructions": "执行代码验证结果，如实报告失败。",
        },
        environment={"type": "openai_hosted"},
        input=(
            "用 Python 计算演示数据 10、20、30 的总和。"
            "把数据与结果写入 /workspace/outputs/summary.json，"
            "重新读取文件检查结果，并说明你做了什么。"
        ),
        stream=True,
    ) as events:
        for event in events:
            print(event.to_json(indent=None), flush=True)
```

运行前需要安装支持 `beta.agents` 的 OpenAI Python SDK，并在应用进程里设置 `OPENAI_API_KEY`。官方列出的权限是会话读写所需的 `api.agents.read`、`api.agents.write`，以及模型推理所需的 `api.responses.write`。SDK 自动添加 Beta 请求头，直接用 HTTP 时需要自己添加。

这里值得观察的是输出过程：API 创建 Session，Agent 在沙箱里执行脚本，流里持续产生事件。应用要从 `agent.session.created` 保存会话 ID，等当前轮结束后检查记录和产物。代码打印出来的 JSON 只是观察窗口，不能直接当成完整的任务状态管理。

## 工具交给平台编排，业务函数仍由应用执行

有了沙箱，不代表写进 `agent.tools` 的函数就会自动在那里执行。远程 MCP 可以由 harness 调用；应用定义的 function tool 则需要自己的处理器。这个边界在[函数工具文档](https://developers.openai.com/api/docs/guides/agents-api/tools/functions)里写得很清楚。

假设 Agent 要查一张工单，过程是：

```text
Agent 请求 get_ticket(ticket_id)
  → Session 出现 requires_action
  → 应用读取 required_actions，执行查询
  → 应用用 turn_id + call_id 交回 tool_result
  → Harness 根据结果继续当前 Turn
```

事件的完整类型是 `agent.session.requires_action`，返回结果使用 `agent.session.input.tool_result`。应用应该按 `required_actions` 判断当前到底欠哪些结果，不能看到历史里有一条 `function_call` 就再执行一次。

查工单还比较简单。如果工具会发消息、修改订单或创建资源，断线恢复就牵涉副作用：外部操作已经成功，但结果没来得及交回怎么办？官方建议按 Session、Turn 和 call ID 持久化执行结果；恢复时先找已保存的结果，不能确定是否执行成功时先核实外部状态。

我的接入取舍是把权限和业务约束放在函数处理器里。模型可以提出动作，处理器仍要检查当前用户是否有权执行，需要确认的操作也在这里等待确认。托管运行框架减少了循环代码，业务事务仍然需要应用负责。

## 断流以后，先找回事实

流式事件让前端看起来像聊天，但背后是一项异步工作。关闭流连接不会取消任务，流断了也不能据此判断执行失败。[托管沙箱文档](https://developers.openai.com/api/docs/guides/agents-api/environments/openai-hosted)明确说明了前者。

正常结束要看 `agent.session.turn.completed`；失败和取消分别有 `agent.session.turn.failed`、`agent.session.turn.cancelled`。`agent.session.idle` 只说明会话空闲。即使 Turn completed，也只是这一轮结束了，某次命令仍可能失败，Agent 最后返回的可能是问题说明。

对于前面的 JSON 例子，我会把「任务完成」落在可检查的结果上：对应轮的产物是否存在，能否解析，里面的数据与总和是否符合要求。收到一个结束事件还不够。

更容易漏掉的是，流不会重放断线期间的事件。[官方恢复流程](https://developers.openai.com/api/docs/guides/agents-api/sessions/events#how-to-recover-a-disconnected-stream)是先重新订阅并缓存新事件，再查询 Session 与保存的 Items，用 `item_id` 恢复本地状态，最后合入缓冲的更新。查询时已经结束的 Item，不要被更早的增量覆盖。

顺序有意义。如果先查历史、再订阅，中间又可能漏掉一段变化。Items 可以找回保存下来的工作，却不保证还原每个错过的中间事件。前端最好区分「暂时看不到进度」和「任务失败」，避免用户一刷新就重新提交整项工作。

## 会话还在，沙箱里的文件未必还在

Session、工作区文件和 Artifact 的生命周期需要分开理解。一个是工作记录，一个是正在使用的文件系统，另一个是发布出来的文件副本。

![同一 Session 的记录可以跨轮继续；沙箱过期会失去实时工作区；OpenAI 托管环境中已发布的产物副本仍可在沙箱过期后下载](/images/notes/openai-agents-api-managed-runtime/state-lifetimes.webp)

在 OpenAI 托管环境里，文件可以在沙箱存续期间跨轮使用。Agent 写进 `/workspace/outputs` 的文件，会在 Turn 完成时发布为不可变的 Artifact。沙箱过期后，已发布的副本仍可下载；其他工作区文件不能仅凭 Session 还存在就认为一定可用。[文件与产物指南](https://developers.openai.com/api/docs/guides/agents-api/environments/files)说明了这个区别。

图中的三行分别对应保存的会话记录、实时工作区和发布副本。它说明的是托管环境；自托管环境的文件要通过自己的基础设施取回，往 `/workspace/outputs` 写文件也不会自动进入平台的 Artifacts API。

如果用户要求修改上一版报告，新一轮可以产生新的副本，应用用 Turn ID 和路径区分版本。真正需要长期保存的成果，应在删除 Session 前下载到自己的存储。Session 能继续对话，不等于它替产品承诺了文件归档和备份。

## 多 Agent 可以打开，但任务边界还得设计

Agents API 支持通过 `agent.multi_agent.enabled` 启用委派，用 `max_concurrent_subagents` 限制同时工作的子 Agent 数量。Harness 提供创建、发消息、等待和中断等协调工具，每个子 Agent 有自己的上下文。[多 Agent 指南](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)建议将它用于独立调查或分别审阅材料这样的工作。

这里有两个实际限制：主 Agent 与子 Agent 共享环境的文件系统，创建子 Agent 不会新建沙箱；当前子 Agent 不支持应用的 function tools，不能假定主 Agent 能用的所有工具都会原样可用。

让两个子 Agent 分别审阅两份发布说明，再由主 Agent 汇总，边界很清楚。让它们同时改同一个配置文件，就需要额外协调。对于自己的产品，我会先用一个 Agent 跑通任务，再把确实独立且耗时的部分拆出去。并发上限只控制同时运行多少个，不会替应用处理共享文件冲突。

## 接入时，我会保留哪些控制

我倾向于先拿一个可检查结果的任务试接，例如根据几份输入材料生成一份报告。应用负责用户身份、工具权限、任务记录和产物验收，平台负责推动 Agent 工作。先观察失败与恢复，再决定是否扩大任务范围。

成本也要按整项任务看。[官方用量说明](https://developers.openai.com/api/docs/guides/agents-api/observability)指出，一项工作可能触发多次模型调用，子 Agent、重试、工具和沙箱也会贡献费用。Session 保存下来不代表后续上下文免费，保持同一会话也不保证每次都命中缓存。平台可以查询轮次与用量、在控制台查看 traces，但文档说明详细 trace 的公开 API 获取与外部导出尚不属于这版 Beta 的能力。

数据要求需要在选型时检查。[Agents API 概览](https://developers.openai.com/api/docs/guides/agents-api/overview)当前注明，它只支持美国的数据驻留，不支持 Zero Data Retention；使用自托管沙箱也不会改变 ZDR 资格。有相关约束的系统，不能等接完接口才确认这一点。

回到那个排查 Bug 的助手，我最希望少维护的是循环、上下文压缩和执行衔接；我仍然需要知道它读了什么、做了什么，测试有没有通过，以及修改是否符合用户要求。Agents API 把前一部分交给了平台。评估它是否适合自己的应用，就看这份分工能否在一次真实任务中跑通，尤其是在工具失败或连接中断的时候。
