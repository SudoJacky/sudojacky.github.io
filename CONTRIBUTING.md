# Contributing

本项目是一个基于 React、React Router 和 Vite 的个人网站。提交修改时，请保持目录职责清晰，并优先采用能够解决当前需求的最小改动。

## 本地开发

```bash
npm install
npm run dev
```

提交前至少运行一次生产构建：

```bash
npm run build
```

## 本地访问计数器

访问计数器由 Cloudflare Worker 和 D1 提供。首次运行本地 Worker 前初始化数据库：

```bash
npm run counter:migrate:local
npm run counter:dev
```

在另一个终端为 Vite 配置本地 Worker 地址：

```powershell
$env:VITE_VISIT_COUNTER_URL="http://localhost:8787"
npm run dev
```

生产构建从 GitHub Actions 仓库变量 `VITE_VISIT_COUNTER_URL` 读取已部署的 Worker 地址。

首次部署时：

1. 运行 `npm run counter:login` 登录 Cloudflare。
2. 运行 `npm run counter:create` 创建 D1，并将返回的 `database_id` 写入 `wrangler.jsonc`。
3. 运行 `npm run counter:migrate:remote` 和 `npm run counter:deploy`。
4. 将 Worker 地址保存为 GitHub Actions 仓库变量 `VITE_VISIT_COUNTER_URL`。

## 目录职责

```text
src/
├── assets/              # 需要由 Vite 打包和生成哈希的资源
├── components/
│   ├── layout/          # 全站布局和跨页面共用结构
│   └── reactbits/       # ReactBits 组件及其局部样式
├── content/             # Notes、Docs 和 Projects 的内容与注册信息
├── pages/               # 与路由对应的页面组件
│   └── projects/        # 需要独立设计的项目页面
├── router/              # 路由映射
├── App.jsx              # 应用根组件
└── main.jsx             # 浏览器入口
worker/
├── migrations/          # D1 数据库迁移
└── index.js             # 访问计数 Worker
```

- 不要为了匹配模板而创建空目录。只有出现真实的共享状态或工具函数时，才增加 `store/` 或 `utils/`。
- 需要通过固定 URL 原样访问的文件放入 `public/`；需要 import、压缩或生成文件哈希的资源放入 `src/assets/`。
- 路由级页面放在 `src/pages/`，可复用的小组件放在 `src/components/`。
- `src/router/AppRouter.jsx` 只负责 URL 与页面的映射，不放页面内容。
- 内容条目的元数据统一维护在 `src/content/contentRegistry.js`。

## 新增 Note

普通 Note 使用 Markdown：

1. 在 `src/content/notes/` 新增 Markdown 文件。
2. 在 `contentRegistry.js` 中导入正文并登记 `slug`、`date`、`title`、`summary` 和 `body`。
3. `NotePage` 会使用统一文章模板渲染。

如果某篇 Note 需要完全独立的布局或交互：

1. 在 `src/pages/notes/` 创建独立页面组件。
2. 在注册信息中增加懒加载组件：

```js
component: lazy(() => import("../pages/notes/ExampleNotePage")),
```

存在 `component` 时使用定制页面，否则使用 Markdown 通用模板。

## 新增 Project

1. 在 `contentRegistry.js` 登记项目的 `slug`、`status`、`title`、`summary` 和 `stack`。
2. 普通项目使用共享项目详情模板。
3. 需要独立视觉和交互时，在 `src/pages/projects/` 创建页面，并在注册信息中增加 `component`。

```js
component: lazy(() => import("../pages/projects/ExampleProjectPage")),
```

VirtualHome 是当前的定制项目页参考。

## 代码约定

- React 组件和文件使用 `PascalCase`，内容目录及 URL slug 使用 `kebab-case`。
- 优先复用现有布局、颜色变量和排版规则。
- 定制页面的 CSS 类使用页面或功能前缀，避免影响其他内容页面。
- 不为单个页面引入全局状态。
- 不在重构页面时顺带修改无关视觉或文案。
