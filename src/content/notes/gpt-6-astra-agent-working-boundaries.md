读 OpenAI 的 [GPT-6 Astra 使用指南](https://developers.openai.com/api/docs/guides/latest-model)，我最在意的是它对默认行为的描述：模型可能更爱确认、更认真地执行技能文件里的要求，也更容易把一个小改动验证得过头。接入时如果只替换模型名，这些变化就会直接落到用户身上。

用户说「帮我修一下」，期待看到修改后的结果；Agent 却可能先列计划，问一句要不要继续。测试已经通过，它还在扩大检查范围。每一步单看都有道理，整段工作却迟迟交付不了。

这份指南给我的启发是，升级模型时也该重新检查应用对工作过程的约定：什么已经得到授权，什么信息值得追问，何时等待工具，以及什么证据足以结束任务。下面按这些问题整理。文中的接口信息核对于 2026 年 9 月 5 日；`latest-model` 是会更新的入口，本文讨论的是当时的 GPT-6 Astra。场景和接入建议是我的理解，不是性能实测。

## 先完成能做的部分，再问真正影响结果的问题

官方把主动推进和持续完成任务放在 prompting 建议的开头。它指出，Astra 在长任务里更能保持连贯，同时也更容易在有歧义时询问用户。这两个特点可以同时出现：模型记得目标，却把本来能自行处理的选择也交回给用户。

假设用户要求修复一个失败测试。读取相关文件、复现问题、修改代码和运行对应测试，通常都属于这项请求已经授权的工作。如果每到一步都确认一次，用户就得一直守在聊天框旁边。

我会把授权范围写成具体动作，并把真正需要决定的问题留出来。例如，修复是否必须兼容旧的数据格式，会改变实现；先读测试还是先读实现，通常可以由 Agent 判断。

指南还建议，确实需要批准时，先把可供审阅的结果准备好。以发布为例，可以先完成修改、验证和发布说明，再停在需要授权的发布动作前。用户此时能看见将要发生什么。

下面是我按这个意思整理的中文约定，可以按应用的权限范围调整：

```text
把用户提出的修改请求落实为可检查的结果。
在已授权范围内，继续完成读取、修改和相关验证。
遇到不影响目标的常规实现选择，自行判断并继续。
缺少的信息会改变结果或授权范围时，提出具体问题，继续处理不依赖答案的工作。
需要批准某个动作时，先完成已授权的准备工作，交出可审阅的结果。
```

这里的前提一直是授权范围明确。系统权限和工具限制仍然有效，提示词不能替应用授予权限。[指南的原始建议](https://developers.openai.com/api/docs/guides/latest-model#initiative-and-follow-through)也保留了对破坏性或不可逆操作的边界。

## 技能文件也会改变 Agent 的工作方式

Astra 对指令更敏感，意味着 `SKILL.md`、`AGENTS.md` 里的含糊要求更容易产生实际影响。官方因此强烈建议审查模型能访问的技能和指令文件。

比如，一个技能为了某类高风险操作写了「开始前先确认方案」，却没有说明适用条件。后来它被用于普通文案修改，Agent 也可能停下来等确认。此时继续往主提示词里加「更主动一些」，很难解释清楚两条要求怎样一起执行。

我更愿意先检查那句确认要求：它到底约束什么动作，有没有把准备工作也挡住，当前用户是否已经给过授权。确实只适用于发布，就把发布写清楚。

这份指南还给了一个有用的排查办法：如果技能导致 Agent 暂停、请求确认或偏离目标，就要求它指出具体文件，引用触发行为的那条指令，并说明哪些是原文要求，哪些是它自己的解释。这样一次莫名其妙的停顿才有位置可查。[相关建议见 Instruction following](https://developers.openai.com/api/docs/guides/latest-model#instruction-following)。

指南建议明确用户要求与技能指南之间的优先关系。落实到产品里，需要把技能放进既定的指令层级，避免某份辅助文件无意间扩大自己的约束范围。

## 等工具时，可以继续做哪些事

Astra 的异步工具调用允许模型发出工具调用后，继续处理不依赖该结果的工作。函数工具或 custom tool 的定义可以设置 `async: true`，结果准备好后再送回。[异步工具文档](https://developers.openai.com/api/docs/guides/async-tool-calling)明确说明，工具仍由应用执行，后台任务也由应用管理。

例如，Agent 发起一项耗时检查后，可以继续阅读与检查结果无关的文档。它要等真实结果回来，才能判断检查是否通过。异步调用给了调度上的空间，数据依赖仍然存在。

返回结果时要保留原始 `call_id`，让 `function_call_output` 对应到原来的 `function_call`。如果中间已经产生后续 response，还要沿当前会话继续，不能把晚到的结果接回一条过时的分支。

对运行时来说，这意味着模型的一次 response 结束后，应用可能还有未完成的工具任务。我的实现倾向是显式记录调用标识、执行状态和结果是否已回传；否则界面说「完成了」，后台却还在运行，后续结果也不知道该交给谁。这是应用设计上的推论，接口不会替你维护这份任务记录。

子 Agent 的使用则需要另一套约定。指南说 Astra 可能比工作流预期更少委派，可以用提示词调整。我会先说明哪些工作可以独立交付，再决定是否并行。例如资料核对可以独立进行，两个 Agent 同时改同一个文件就需要协调写入。工具异步、子任务并行和共享文件协作，各自要处理的问题并不相同。

## 用户中途改要求，界面要能解释指令到了哪一步

Mid-turn steering 允许用户在模型工作时追加要求。当前文档限定它用于 GPT-6 Astra 的 Responses WebSocket 连接：收到 `response.created` 后，在同一连接上发送 `response.steer`，并用 `previous_response_id` 指向目标 response。

最容易误解的是确认事件。`response.steer.accepted` 只说明输入已排队，不能据此告诉用户模型已经按新要求执行。[Steering 文档](https://developers.openai.com/api/docs/guides/steering)给出的过程是：服务端先结束当前输出 Item 和已经运行的托管工具工作，再创建带有追加要求的后续 response；如果还缺客户端工具结果或批准，就先等待这些输入。

```text
response.create
  → response.created
  → 用户追加要求，发送 response.steer
  → response.steer.accepted：输入已排队
  → 当前 response 收尾；必要时补交工具结果或批准
  → 后续 response 应用追加要求，继续工作
```

如果原 response 被 steering 中断，它会以 `response.incomplete` 结束，原因是 `steered`。如果它已经正常完成，也仍可能接着产生 steering 的后续 response。因此，收到第一个完成事件就关闭整段任务，会漏掉用户刚补充的要求。

更实际的一条限制是：steering 不会改写已经发出的内容，不会撤销先前动作，也不会取消已经开始的工具。用户说「先别部署」时，如果部署工具已经启动，应用仍需按自己的取消机制处理。界面最好区分「已收到追加要求」与「已开始按新要求执行」，别让一个发送成功的提示承担取消承诺。

排队的 steering 还只存在于当前连接。断线后不能假定它仍在等待执行；应用要记录发出的输入，对照响应事件和历史判断是否需要重放。这些限制决定了聊天框能否在长任务里可靠地接收纠正。

## 改推理强度时，不必总去改请求前缀

我在[之前关于 Coding 会话成本的 Note](#/notes/efficient-coding-agent-sessions)里，把稳定模型和思考强度作为减少缓存扰动的建议。Astra 的 `configuration_update` 给这个建议补了一个具体例外：可以保持请求级的 `reasoning.effort` 不变，在两次 response 之间用输入 Item 调整后续的推理强度。

假设请求级配置最初是 `low`，下一轮遇到困难问题，就把下面这个 Item 放在下一条用户消息之前：

```json
{
  "type": "configuration_update",
  "reasoning": {
    "effort": "high"
  }
}
```

请求级的 `reasoning.effort` 仍保持 `low`。更新选择的 `high` 会持续用于后续 response，直到另一项更新覆盖它。这样保留了原始 prompt 前缀，便于缓存复用；缓存是否命中仍受正常缓存条件约束。

[推理指南](https://developers.openai.com/api/docs/guides/reasoning#change-reasoning-mid-conversation)里的限制也要一起读：目前只支持 Astra 的 standard、single-agent 模式，只能修改推理强度；不能把两个更新 Item 紧挨着放，也不能与自动压缩或自动截断一起使用。独立的 `/responses/compact` 端点会拒绝含有这些更新的历史。显式 `compaction_trigger` 仍可使用，但压缩后要重新设置所需强度。

还有一处会影响排查：response 返回的 `reasoning.effort` 继续报告请求级设置。应用如果只记录这个字段，就可能把实际选用 `high` 的一轮记成 `low`。采用这项能力后，我会连同配置更新 Item 一起记录有效强度。

这是轮次之间的配置更新。用户在正在生成的一轮里追加要求，要用前一节的 steering。

## 迁移前，检查真正会让请求失败的参数

行为提示词可以逐步调整，接口不兼容会直接挡住请求。按[迁移清单](https://developers.openai.com/api/docs/guides/latest-model#update-api-and-model-parameters)，接入 `gpt-6-astra` 时至少检查这些地方：

| 现有配置 | 需要核对的变化 |
| --- | --- |
| 使用 Chat Completions 调工具 | Astra 支持 Chat Completions，但工具调用要求使用 Responses |
| 推理强度为 `none` 或 `minimal` | 从 `low` 开始比较结果；其他情况先保留现有有效强度。Astra 不支持 `none` |
| 请求带 `temperature`、`top_p`、`top_logprobs` | 移除这些不受支持的参数 |
| 请求读取 logprobs | Chat Completions 移除 `logprobs`；Responses 从 `include` 移除 `message.output_text.logprobs` |
| 从 GPT-5.5 或更早版本迁移缓存配置 | 将 `prompt_cache_retention` 换成 `prompt_cache_options.ttl: "30m"`，同时检查缓存边界和写入计费 |
| EU 数据驻留环境使用 Fast mode | 使用 Standard；该环境下不支持 `service_tier: "fast"` 或 `"priority"` |

缓存尤其容易被当成一个字段更名。[当前缓存文档](https://developers.openai.com/api/docs/guides/prompt-caching#summary-of-model-differences)列出的 GPT-5.6 及之后模型规则是：缓存读取按未缓存输入费率的 0.1 倍收费，缓存写入按 1.25 倍收费。评估迁移成本时要同时看写入、复用和整项任务消耗，不能只看缓存命中率。

## 写作和验证，都需要明确的结束条件

指南对写作的描述很直白：Astra 倾向使用详细回答、列表、表格和 Markdown，也可能重复某些惯用表达。想让文章自然，只写一句「去除 AI 味」不够具体。

对技术 Note，我会要求先说判断，再用接口行为或例子支撑；能连成段落的内容就直接写成段落，确实需要逐项比较时再用表格。删掉空泛的开场和结尾，把「显著提升可靠性」改成读者可以检查的行为，例如「断线后记录未应用的输入，再决定是否重放」。正文里也要分清官方说明、作者建议和实测结果。[写作建议的原文在这里](https://developers.openai.com/api/docs/guides/latest-model#personality-and-writing-style)。

验证同样需要校准。官方提醒，Astra 对编码任务可能测得比实际需要更广。一个文案修改通过了相关构建和页面检查，没有新证据时就该交付；一次状态恢复改动则需要覆盖断线、重放等会改变结果的过程。检查范围取决于改动会破坏什么。

如果要评估这次模型迁移，我会保留几类原有任务作对照：信息齐全的小修复，看它是否无故确认；需要等待工具的任务，看它能否推进独立工作；中途改变要求的长任务，看追加输入是否落实；最后再看交付时给出的验证证据。完成质量相近时，再比较耗时、token 消耗和人工介入次数。读完指南，我最想先测的是那些原本需要用户反复说「继续」的任务。
