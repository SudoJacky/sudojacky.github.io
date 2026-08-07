昨天，Google Developers Blog 发了一篇 [Agent Plugins 的介绍](https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/)。第一眼看上去，这又是一个「插件系统」。读完规范后，我觉得叫它「Agent 能力的包装格式」更准确。

Agent Skills 已经能保存可复用的指令、脚本和参考资料，MCP 也早就在连接 Agent 与外部工具。真正麻烦的是把二者交付给不同客户端时，外面那层盒子没有统一：目录要重排，manifest 要重写，MCP 配置字段也各不相同。能力没有变，包装却要维护好几份。

Agent Plugins 1.0.0 想管的就是这个盒子。

## 问题出在包装，不在零件

假设我写了一个周报 Skill，又配了一台 MCP server 去查内部数据库。在客户端 A 里，它们已经可以一起工作。迁移到客户端 B 时，Skill 和 MCP server 本身可能一行都不用改，但 B 有另一套插件目录、元数据和传输配置。于是我复制一份项目，做一层适配，之后再看着两份包装慢慢走散。

![拿着同一组组件的小机器人，被不同形状的包装盒难住](/images/notes/agent-plugins/incompatible-boxes.webp)

[Google 的文章](https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/)把问题说得很直接：Agent Skills 和 MCP 各自已经具备可移植性，缺的是装载它们的公共容器。不同客户端重复发明这个容器，插件作者就得为同一组组件维护多个版本。

[Agent Plugins](https://agent-plugins.org/)给出的办法很小。一个插件就是一个目录，根目录有 `plugin.json`，组件放在约定位置：

```text
reports-plugin/
├── plugin.json
├── skills/
│   └── summarize/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── mcp.json
└── com.example.client/
    └── hooks/
```

最小的 manifest 只有身份和目标规范版本：

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "reports-plugin"
}
```

客户端读完 `plugin.json` 后，不需要再问组件放在哪里。Skills 只从 `skills/` 的直接子目录发现，每个 Skill 仍按 Agent Skills 规范组织。MCP server 只从根目录的 `mcp.json` 读取，配置必须明确写出 `stdio`、`streamable-http` 或兼容旧服务的 `sse` 传输类型。

这里没有新的工具协议。Agent Plugins 只约定怎么把已有组件放进同一个可识别的目录。

## v1 的可移植核心其实很窄

名字里的 Plugins 很容易让人想到命令、Hook、子 Agent、主题、安装器和应用商店。[1.0.0 规范](https://agent-plugins.org/specification)却只定义了两类标准组件：Skills 和 MCP servers。

命令或 Hook 当然可以随包交付，但要放进客户端自己的反向域名命名空间，例如 `com.example.client/`。认识这个命名空间的客户端自行解释，其他客户端直接忽略。`plugin.json` 里的客户端专属元数据也要进入同名的 `extensions` 字段，不能混进公共字段。

这条边界很实用。真正相同的部分有固定结构，确实不同的部分也有合法位置，不必为了看起来「完全跨平台」而假装每个客户端都具备同一种生命周期和交互方式。

代价也很明确。一个带有客户端扩展的插件，只有 Skills 和 MCP 配置可以期待跨客户端复用；扩展目录里的能力依然需要逐端实现。兼容客户端也不必支持所有组件类型。规范允许一个只加载 Skills 的客户端符合要求，所以「能安装 Agent Plugin」不等于「包里的所有能力都能运行」。

## 固定目录减少了不少猜测

`plugin.json` 不能改写 Skill 的发现路径，也不能内联声明 MCP server。组件位置是规范的一部分，不存在一套需要继续协商的发现优先级。

这看起来不够灵活，却让加载过程简单了很多。`skills/` 不存在，不算错误；某个 Skill 无效，客户端跳过它，继续加载其他组件。`mcp.json` 里的一个 server 启动失败，也不能拖垮同包的 Skills。规范把错误限制在尽可能小的范围，同时要求客户端报告失败，避免把残缺加载伪装成成功。

manifest 本身则相当严格。它使用封闭 schema，公共顶层字段只有规范列出的那些。路径也必须留在插件根目录内，不能借助 `../`、符号链接或 Windows reparse point 逃出包边界。这些规则防的是插件加载器误读或误执行包外文件。

不过，[规范特意提醒](https://agent-plugins.org/specification)，路径约束不是进程沙箱。一个 `stdio` MCP server 启动后能访问什么，仍取决于客户端如何隔离进程、授予权限和整理环境变量。目录安全和运行时安全是两件事。

![小机器人带着统一工具箱，依次通过权限、沙箱和信任检查](/images/notes/agent-plugins/security-checkpoint.webp)

## 它不是安装器，也不是应用商店

Agent Plugins v1 没有规定插件怎样安装和更新，也没有定义分发协议、权限模型、来源验证、审批界面或沙箱要求。[面向插件作者的文档](https://agent-plugins.org/plugin-authors)把这些职责明确留给客户端。

我一开始觉得缺得有点多。再想一下，如果规范同时统一 IDE、CLI 和企业平台的权限交互，它很快就会长成一套没人能完整实现的上层框架。现在的做法只取一个足够小的交集：包长什么样，客户端怎样发现其中的可移植组件。

Google 的文章还把生态拆成四层：Agentic Resource Discovery（ARD）负责发现可用资源，AI Catalog 描述可被索引的条目，Agent Plugins 负责打包，真正的运行仍交给 Agent Skills 和 MCP。四层可以分别采用。插件可以没有 catalog 条目，Skill 也可以不进入插件。

这个拆分避免了一个常见误会：格式统一并不会自动带来分发网络。`plugin.json` 解决的是「拿到目录后怎么读」，不是「去哪里找到它」「是否应该信任它」或「谁来批准它运行」。

## 不是每个 Skill 都需要升级成 Plugin

如果只有一个 Skill，直接交付 Skill 目录更省事。只有一台 MCP server，并且只服务一个客户端，也没有必要先套一层插件结构。[Google 的建议](https://developers.googleblog.com/agent-plugins-package-your-skills-tools-and-more/)同样克制：当多个组件本来就属于同一项能力，而且需要一起迁移时，Plugin 才开始值回那份 manifest。

我会用一个很实际的判断：更新其中一个组件时，是否经常需要同步检查另一个？如果周报 Skill 依赖报表 MCP server 的工具名称和返回结构，它们应该一起版本化。若两个组件只是碰巧来自同一家公司，把它们塞进一个包只会放大权限和更新范围。

作者还要把可移植部分与客户端专属部分分开。能用标准 Skill 表达的流程就留在 `skills/`，能用 MCP 暴露的工具就写进 `mcp.json`。只有某个客户端确实独有的 Hook 或命令，才进入它的扩展命名空间。公共核心越干净，插件换客户端时需要解释的例外越少。

## 1.0.0 仍是一份 Working Draft

版本号看起来已经稳定，但[规范页面](https://agent-plugins.org/specification)目前仍标着 Working Draft。这个状态值得写在旁边。现在可以按 1.0.0 尝试打包，也要预期实现细节和兼容名单还会变化。

项目由开放的 Technical Steering Committee 管理。Amazon、Cursor、Microsoft、OpenAI 和 Vercel 的维护者参与了初始工作，Google 在这次公告中加入 Core Maintainers。Google 同时宣布 Agents CLI 与 Data Agent Kit 已采用这种格式，后者把面向 BigQuery、Spanner、Cloud SQL 等服务的 Skills 和 MCP servers 放进可移植插件。

这些支持让规范有了真实实现，但它有没有成为公共格式，最终还得看两个更普通的问题：插件作者是否愿意只维护一份可移植核心，客户端是否能把部分支持、启动失败和权限请求讲清楚。

盒子统一之后，剩下的难题不会消失。客户端仍要告诉用户：加载了哪些指令，准备启动哪个进程，它能读写什么，失败后又跳过了什么。格式能搬走，信任不能跟着 manifest 自动生成。
