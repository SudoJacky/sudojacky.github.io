把三个接口最小的请求和返回值并排放在一起，大模型 API 的变化就很明显了：

```text
POST /v1/completions
prompt  -> choices[].text

POST /v1/chat/completions
messages[] -> choices[].message

POST /v1/responses
input / instructions / tools -> output[] Items
```

表面看只是 `prompt` 变成 `messages`，再变成 `input`。真正变化的是接口怎样理解一次模型调用。Completions 把它看成文本续写，Chat Completions 把它看成一轮对话，Responses 则把它建模成一次可能包含推理、工具调用和多种输出的执行。

这条演进线也解释了大模型应用这些年的重心变化：先让模型把一句话接下去，再让它分清谁在说话，后来又要求它在回答前搜索、读文件、运行代码，并把中间发生的事交给程序处理。

## Completions：接口几乎贴着语言模型本身

早期的 `/v1/completions` 很接近自回归语言模型的原始能力。应用提交一段 `prompt`，模型预测后续 token，接口把生成的文本放进 `choices[].text`。[官方 API 参考](https://developers.openai.com/api/reference/resources/completions)至今仍把它描述为“给定 prompt，返回一个或多个预测续写”，还可以返回每个位置的候选 token 概率。

这套设计简单，也足够通用。分类、摘要、改写和问答都能变成同一种任务：先在字符串里写好说明和示例，再留一个位置让模型续写。

```text
将下面的评论分为 positive 或 negative。

评论：这个版本终于不闪退了。
标签：
```

对话也能这样伪装出来：

```text
System: 你是一个耐心的助手。
User: 为什么天空是蓝色的？
Assistant: 因为……
User: 用小学生能懂的方式再说一次。
Assistant:
```

麻烦在于，`System:`、`User:`、分隔符和最后那个 `Assistant:` 对 API 都没有结构意义。它们只是 prompt 里的字符。开发者要自己保证模板前后一致，拼接历史，处理 stop sequence，还要防止用户输入意外穿透自己设计的边界。

当一次调用主要用于补全文本时，这种自由很合适。等聊天成为主流产品形态，字符串开始承担太多协议工作。应用真正需要表达的是“这条是系统约束，那条来自用户，这是模型上一轮的回答”，而不是一段碰巧长得像聊天记录的文本。

## Chat Completions：先把说话者写进协议

2023 年，Chat Completions 随 GPT-3.5 Turbo 进入 API。请求的基本单位从字符串换成了带角色的消息：

```json
{
  "messages": [
    { "role": "system", "content": "回答要简洁。" },
    { "role": "user", "content": "为什么天空是蓝色的？" },
    { "role": "assistant", "content": "因为大气会散射阳光。" },
    { "role": "user", "content": "再说得具体一点。" }
  ]
}
```

[Chat API 参考](https://developers.openai.com/api/reference/resources/chat)对它的定义很直接：提交组成一次对话的消息列表，模型返回一条响应消息。角色成为正式字段后，应用不必再用换行和标签模拟说话者边界。模型也可以针对这种结构训练和优化。

这是第一次演进要解决的问题：产品已经从“生成一段文本”转向“和模型持续交互”，接口需要承认对话本身就是数据结构。

不过，Chat Completions 只把会话格式化了，没有替应用保存会话。每次请求仍要由应用挑选并重新提交历史消息。上下文太长时删什么、摘要放在哪里、不同用户的记录怎样隔离，都是调用方的工作。[Responses 迁移文档](https://developers.openai.com/api/docs/guides/migrate-to-responses)现在仍把这一点列为两者的主要差异：Chat Completions 的对话状态需要手动管理。

后来的功能也让 `message` 越装越满。Function calling 让模型可以返回函数名和参数；视觉输入把 `content` 变成多种内容块；结构化输出、拒答信息和并行工具调用又增加了新的字段。它们都很有用，只是“聊天消息”已经不再足以概括模型在做什么。

尤其是工具调用。Chat Completions 会告诉应用“请调用这个函数”，应用执行函数，再把结果作为 tool message 加进历史，然后发起下一次模型请求。[官方 function calling 指南](https://developers.openai.com/api/docs/guides/function-calling)把它写成五步流程，其中两次模型请求和中间的函数执行都由应用串起来。此时 API 返回的已经不一定是一句给人看的话，也可能是一条等待程序处理的动作。

## Assistants API 是中间那座桥

Completions 到 Chat Completions 再到 Responses 看起来是一条直线，中间其实还有一段重要的试验。2023 年的 Assistants API 把 Assistant、Thread、Message、Run 和托管工具做成服务端对象，尝试替应用管理会话与执行过程。

它证明了开发者确实需要线程、文件搜索、代码执行和 Run 状态，也暴露出另一面：为了发起一次工作，应用要理解并协调多种对象及其生命周期。Chat Completions 足够直接，却把 Agent 循环留给应用；Assistants 管得更多，接口也更重。

OpenAI 在 2025 年 3 月 11 日发布 Responses API 时，明确说要把 Assistants 的能力带到一个更容易使用的接口里。[官方 changelog](https://developers.openai.com/api/docs/changelog)把 Responses、网页搜索、文件搜索、计算机操作和 Agents SDK 放在同一次发布中。这也是为什么 Responses 不能只理解成“新版 Chat Completions”：它同时吸收了 Chat 的直接调用方式和 Assistants 对工具、状态的需求。

## Responses：返回的是一次执行记录

Responses 的名字有点宽泛，数据模型却比 Chat 更具体。它不再假设模型只会生成一条 assistant message，而是返回一组有明确类型的 Item：

```text
response.output
├── reasoning
├── message
├── function_call
├── web_search_call
├── file_search_call
└── ...
```

`message` 只是 Item 的一种。函数调用、函数结果和推理信息各自独立，不必继续塞进同一个消息对象。[迁移文档](https://developers.openai.com/api/docs/guides/migrate-to-responses)解释了这个取舍：Chat Completions 的输入输出是 Message 数组，Responses 使用 Items，因为 Item 更适合表示模型可能采取的不同动作。

这个变化对 reasoning model 尤其重要。一次工具调用前后的推理上下文需要被保留下来，不能只把最后那段自然语言塞回下一轮。Responses 可以用 `previous_response_id` 串起前后两次调用，也可以让应用自己携带完整的 Item 列表。服务端状态减少了历史拼装代码，但它不是免费记忆：官方文档说明，即使用 `previous_response_id`，链上此前的输入 token 仍会按输入计费。

Responses 还把托管工具放进同一个请求。模型可以在一次 API 调用中使用 web search、file search、code interpreter、computer use 或远程 MCP，再根据工具结果继续生成。这里要留一个边界：应用自己的 function 仍由应用执行，结果要带着对应的 `call_id` 交还模型。Responses 让调用方直接控制这个循环；如果希望框架替你运行循环、处理 handoff 和 tracing，[官方对比](https://developers.openai.com/api/docs/guides/agents)建议使用 Agents SDK。

流式返回也跟着变了。Chat Completions 主要给出 `choices[0].delta`，调用方逐块拼接内容。Responses 使用带类型的语义事件，例如 `response.created`、`response.output_item.added`、`response.output_text.delta`、工具执行事件和 `response.completed`。[Streaming 指南](https://developers.openai.com/api/docs/guides/streaming-responses)称它们为 semantic events。前端可以只听文本增量，运行面板则能同时展示搜索、函数参数和完成状态。

当输出里出现多种动作后，流也不能只是一条字符水管了。

## 三代接口到底改变了什么

| 维度 | Completions | Chat Completions | Responses |
| --- | --- | --- | --- |
| 基本输入 | 一段 `prompt` | 带角色的 `messages[]` | 字符串、消息或 Items，加 `instructions` 与 `tools` |
| 基本输出 | `choices[].text` | `choices[].message` | 有类型的 `output[]` Items |
| 对话状态 | 应用拼接字符串 | 应用维护并重发消息 | 可手动携带，也可用 response ID 或 Conversation 串联 |
| 工具 | 没有通用工具协议 | Function calling，应用执行循环 | 托管工具可在请求内运行，自定义函数仍由应用执行 |
| 流式语义 | 文本增量 | message delta | 生命周期、文本、推理与工具等语义事件 |
| 适合的心智模型 | 续写器 | 对话模型 | 可观察的模型执行 |

比字段数量更值得留意的是，API 的“主语”一直在变。

Completions 的主语是 token：给模型一段前缀，它继续写。Chat Completions 的主语是参与者：系统、用户、助手和工具轮流发消息。Responses 的主语则是一次执行：它何时开始，产生了什么 Item，调用了哪些工具，怎样结束。

## 趋势：API 正在长成一层运行时协议

第一条趋势是结构越来越有语义。自由文本先被拆成带角色的消息，消息又被拆成 reasoning、message、function call 和 tool result。类型越细，应用越少依赖字符串约定，也越容易记录、回放和验证模型行为。

第二条趋势是状态从调用方独占，变成可以选择由平台衔接。`previous_response_id` 和 Conversation 降低了多轮调用的接线成本，后台任务、compaction 和长时间运行也有了落点。代价同样清楚：存储策略、数据保留、token 成本和供应商绑定必须进入架构评审，不能因为少传了几段 JSON 就当作它们不存在。

第三条趋势是 API 开始表达过程。早期应用只关心最后那段文字；Agent 产品还要知道模型正在搜索、等待函数结果、运行代码还是已经失败。typed Items 和 semantic events 给了这些状态正式的位置，可观察性因此进入协议，而不是靠日志猜测。

最后，模型服务正在吸收一部分过去属于应用框架的工作。网页搜索、文件检索、代码执行和 MCP 可以直接挂到一次 response 上，reasoning context 也能跨工具调用延续。应用仍然负责权限、业务事务、外部函数和停止条件。Responses 更像一块可编排的执行底座，还不是一个替你承担产品责任的全自动 Agent。

## 现在该选哪一个

[OpenAI 当前的迁移建议](https://developers.openai.com/api/docs/guides/migrate-to-responses)很明确：新项目优先使用 Responses，Chat Completions 继续受支持。两句话要一起读。

如果正在做新的文本生成、reasoning、图片理解或工具型应用，从 Responses 开始更省事。它也是后续托管工具和 Agent 能力主要扩展的位置。

已经稳定运行在 Chat Completions 上的简单聊天服务，不必只为端点更新而仓促迁移。等你需要保留 reasoning Items、使用托管工具、用 response ID 衔接状态，或者消费语义流事件时，迁移收益才会明显。迁移也不只是把 URL 换成 `/v1/responses`：输出从 `choices` 变成 Items，结构化输出和 function schema 的位置不同，状态与存储策略也要重新决定。

Legacy Completions 则适合仍绑定旧模型或特定补全行为的系统。[当前模型文档](https://developers.openai.com/api/docs/models/gpt-3.5-turbo-instruct)已经把只兼容它的模型归入 legacy。新建通用大模型应用时，很难再找到绕过 Chat 或 Responses、直接回到字符串续写的理由。

回头看，接口演进并不是模型突然学会了三种完全不同的能力。很多事情以前也能靠 prompt、消息拼接和外层循环做出来。变化在于，那些曾经藏在应用代码里的约定被一层层写进了协议。

当 API 只返回文本时，我们在调用一个模型。等它开始返回状态、动作和事件，我们已经在接入一段运行过程。
