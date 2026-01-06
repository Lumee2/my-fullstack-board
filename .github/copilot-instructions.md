# Copilot 使用说明（项目专用）

简短、可操作的指令，帮助 AI 代码代理在本仓库内快速高效工作。保留已有提示，重点补充架构、关键文件与可执行示例。

1) 大体架构
- 框架：Next.js App Router（`app/`），默认 Server Components，只有需要浏览器能力的页面才使用 `use client`。
- 认证：`next-auth`，配置位于 `app/lib/auth.ts`，路由在 [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts#L1)。服务端通过 `getServerSession(authOptions)` 获取 session。
- 数据：使用 `@neondatabase/serverless`（neon）和 `@auth/pg-adapter`，通过 tagged-template 与 Postgres 通信（见 [app/api/messages/route.ts](app/api/messages/route.ts#L1)）。

2) 关键文件与示例（快速定位）
- 路由与 API：`app/api/*` 下均为 Route Handlers（导出 `GET`/`POST`/`DELETE` 等）。示例：留言 API 在 [app/api/messages/route.ts](app/api/messages/route.ts#L1)。
- 客户端入口：`app/page.tsx`（使用 `use client`），示例展示了如何 fetch `/api/messages` 并调用 POST/DELETE。
- 认证实现：`app/lib/auth.ts`（导出 `authOptions`），路由导出位于 [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts#L1)。
- 全局样式：`app/globals.css`（Tailwind + PostCSS 配置在 `postcss.config.mjs`）。

3) 常见约定与实用规则（只针对本项目）
- Route Handler 风格：在 `app/api/*` 中使用函数式导出（不要改为 pages API）。在服务端路由里使用 `getServerSession(authOptions)` 进行鉴权检查。
- DB 调用：使用 neon 的 tagged-template 形式，例如：
   ```ts
   const sql = neon(process.env.DATABASE_URL!);
   const rows = await sql`SELECT * FROM messages`;
   ```
- 删除接口约定：`DELETE` 通过查询参数传递 id（例如 `/api/messages?id=123`），不要期待 body 中带 id（前端也按此约定实现）。

4) 本地开发与部署命令
- 本地开发：`npm run dev` （Next 默认 http://localhost:3000）。
- 构建：`npm run build`，生产启动：`npm start`。
- 必需环境变量（本地测试认证/DB）：`DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。

5) 集成点与易出错区域（AI agent 应注意）
- 修改 `app/lib/auth.ts` 可能影响所有 API 的鉴权；在变更前检查 `app/api/*` 中对 `getServerSession` 的调用。
- 数据库交互假定 `DATABASE_URL` 可用，且查询以 tagged-template 方式构造，避免用字符串拼接以免破坏格式或引入注入风险。
- 路由处理器与前端交互的约定（如 DELETE?id=）是约定而非标准，AI 修改后需同步更新前端调用。

6) 编辑/PR 建议（Agent 操作守则）
- 保持改动原子，修改 API 签名时同时更新前端调用位置（例如 `app/page.tsx`）。
- 若需新增 env var，请在 PR 描述中列出用途与运行示例。

7) CI 与部署（可选，常见场景）
- 主流托管：推荐使用 Vercel（与 Next.js 原生兼容）。部署时请在 Vercel 项目的 Environment Variables 中添加 `DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。
- Neon：如果使用 Neon，请把 Neon 提供的连接串作为 `DATABASE_URL`（示例：`postgres://...`）。不要把连接串写入源码或前端环境。
- 部署注意事项：
    - 构建命令：`npm run build`，输出由 Next.js 管理。
    - 预览/分支部署：确保 Vercel 的 Preview 环境也配置了 `DATABASE_URL` 和 OAuth 凭证，否则与本地行为不同。
    - Server Components / Edge：本仓库使用 App Router（Server Components 默认），如果将特定 API 或中间件移到 Edge，请验证兼容性（例如 `neon` 客户端是否支持 Edge）。
- CI / GitHub Actions：如果你添加 CI，确保 job 在运行 `npm run build` 前注入所需的 env vars，且对敏感信息使用 GitHub Secrets。

如果你希望我把一個示例 `vercel.json`、GitHub Actions workflow 或一個部署檢查腳本加入倉庫，我可以接着創建這些文件。
# Copilot 使用说明（项目专用）
简短、可操作的指令，帮助 AI 代码代理在本仓库内快速高效工作。保留已有提示，重点补充架构、关键文件与可执行示例。
1) 大体架构
- 框架：Next.js App Router（`app/`），默认 Server Components，只有需要浏览器能力的页面才使用 `use client`。
- 认证：`next-auth`，配置位于 `app/lib/auth.ts`，路由在 [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts#L1)。服务端通过 `getServerSession(authOptions)` 获取 session。
- 数据：使用 `@neondatabase/serverless`（neon）和 `@auth/pg-adapter`，通过 tagged-template 与 Postgres 通信（见 [app/api/messages/route.ts](app/api/messages/route.ts#L1)）。

2) 关键文件与示例（快速定位）
- 路由与 API：`app/api/*` 下均为 Route Handlers（导出 `GET`/`POST`/`DELETE` 等）。示例：留言 API 在 [app/api/messages/route.ts](app/api/messages/route.ts#L1)。
- 客户端入口：`app/page.tsx`（使用 `use client`），示例展示了如何 fetch `/api/messages` 并调用 POST/DELETE。
- 认证实现：`app/lib/auth.ts`（导出 `authOptions`），路由导出位于 [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts#L1)。
- 全局样式：`app/globals.css`（Tailwind + PostCSS 配置在 `postcss.config.mjs`）。

3) 常见约定与实用规则（只针对本项目）
- Route Handler 风格：在 `app/api/*` 中使用函数式导出（不要改为 pages API）。在服务端路由里使用 `getServerSession(authOptions)` 进行鉴权检查。
- DB 调用：使用 neon 的 tagged-template 形式，例如：
   ```ts
   const sql = neon(process.env.DATABASE_URL!);
   const rows = await sql`SELECT * FROM messages`;
   ```
- 删除接口约定：`DELETE` 通过查询参数传递 id（例如 `/api/messages?id=123`），不要期待 body 中带 id（前端也按此约定实现）。

4) 本地开发与部署命令
- 本地开发：`npm run dev` （Next 默认 http://localhost:3000）。
- 构建：`npm run build`，生产启动：`npm start`。
- 必需环境变量（本地测试认证/DB）：`DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。

5) 集成点与易出错区域（AI agent 应注意）
- 修改 `app/lib/auth.ts` 可能影响所有 API 的鉴权；在变更前检查 `app/api/*` 中对 `getServerSession` 的调用。
- 数据库交互假定 `DATABASE_URL` 可用，且查询以 tagged-template 方式构造，避免用字符串拼接以免破坏格式或引入注入风险。
- 路由处理器与前端交互的约定（如 DELETE?id=）是约定而非标准，AI 修改后需同步更新前端调用。

6) 编辑/PR 建议（Agent 操作守则）
- 保持改动原子，修改 API 签名时同时更新前端调用位置（例如 `app/page.tsx`）。
- 若需新增 env var，请在 PR 描述中列出用途与运行示例。

7) CI 与部署（可选，常见场景）
- 主流托管：推荐使用 Vercel（与 Next.js 原生兼容）。部署时请在 Vercel 项目的 Environment Variables 中添加 `DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。
- Neon：如果使用 Neon，请把 Neon 提供的连接串作为 `DATABASE_URL`（示例：`postgres://...`）。不要把连接串写入源码或前端环境。
- 部署注意事项：
   - 构建命令：`npm run build`，输出由 Next.js 管理。
   - 预览/分支部署：确保 Vercel 的 Preview 环境也配置了 `DATABASE_URL` 和 OAuth 凭证，否则与本地行为不同。
   - Server Components / Edge：本仓库使用 App Router（Server Components 默认），如果将特定 API 或中间件移到 Edge，请验证兼容性（例如 `neon` 客户端是否支持 Edge）。
- CI / GitHub Actions：如果你添加 CI，确保 job 在运行 `npm run build` 前注入所需的 env vars，且对敏感信息使用 GitHub Secrets。

如果你希望我把一个示例 `vercel.json`、GitHub Actions workflow 或一个部署检查脚本加入仓库，我可以接着创建这些文件。
# Copilot 使用说明（项目专用）

简短、可操作的指令，帮助 AI 代码代理快速在本仓库内安全高效工作。

1. 项目概览
   - 基于 Next.js App Router（root 在 `app/`），默认为 Server Components。
   - 身份认证使用 `next-auth`，配置位于 `app/lib/auth.ts`，路由导出在 `app/api/auth/[...nextauth]/route.ts`。
   - 数据库通过 `@neondatabase/serverless`（neon）和 `@auth/pg-adapter` 连接，连接串由 `DATABASE_URL` 环境变量提供。
   - 留言功能的 API 在 `app/api/messages/route.ts`，前端客户端位于 `app/page.tsx`（这是一个 `use client` 页面）。

2. 运行与调试
   - 本地开发：运行 `npm run dev`（Next 默认在 http://localhost:3000）。
   - 构建：`npm run build`，生产启动：`npm start`。
   - 必需的环境变量（至少在本地测试 API/认证时）：`DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。

3. 重要约定与实现细节（务必遵守）
   - API 编写：在 `app/api/*` 中使用 Route Handlers（导出 `GET`/`POST`/`DELETE` 等）。服务端需要用 `getServerSession(authOptions)` 来获取会话。
   - 数据库调用使用 `neon` 的 tagged-template：
     ```ts
     const sql = neon(process.env.DATABASE_URL!);
     const rows = await sql`SELECT * FROM messages`;
     ```
   - 删除接口：`DELETE` 在 `app/api/messages/route.ts` 通过 URL 查询参数 `?id=` 接收要删除的消息 ID（注意：前端也使用这种方式，不用在 body 中传 ID）。
   - auth 导出：`app/lib/auth.ts` 同时导出 `authOptions` 和 NextAuth 的 `handlers`（路由直接 re-export）。对 auth 的改动可能影响所有 API 的鉴权行为。
# Copilot 使用说明（项目专用）

简短、可操作的指令，帮助 AI 代码代理在本仓库内快速高效工作。保留并合并已有提示，重点补充架构、关键文件与可执行示例。

1) 大体架构（为什么这样组织）
- 框架：Next.js App Router，应用根目录为 `app/`，默认 Server Components。客户端页面通过在文件顶部使用 `use client` 标记。
- 认证/鉴权：使用 `next-auth`，`app/lib/auth.ts` 导出 `authOptions` 与 `handlers`；路由在 `app/api/auth/[...nextauth]/route.ts`。多数 API 在服务端通过 `getServerSession(authOptions)` 获取 session。
- 数据存储：使用 `@neondatabase/serverless`（neon）和 `@auth/pg-adapter`，通过 tagged-template SQL 交互（见 `app/api/messages/route.ts`）。将 DB 连接留在服务端并通过 `DATABASE_URL` 环境变量管理。

2) 关键文件与示例（快速定位）
- 路由与 API：`app/api/*` 下均为 Route Handlers（导出 `GET`/`POST`/`DELETE` 等）。示例：留言 API 在 [app/api/messages/route.ts](app/api/messages/route.ts#L1)。
- 客户端入口：`app/page.tsx`（使用 `use client`），示例展示了如何 fetch `/api/messages` 并调用 POST/DELETE。
- 认证实现：`app/lib/auth.ts`（导出 `authOptions`），路由导出位于 [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts#L1)。
- 全局样式：`app/globals.css`（Tailwind + PostCSS 配置在 `postcss.config.mjs`）。

3) 常见约定与实用规则（只针对本项目）
- Route Handler 风格：在 `app/api/*` 中使用函数式导出（不要改为 pages API）。在服务端路由里使用 `getServerSession(authOptions)` 进行鉴权检查。
- DB 调用：使用 neon 的 tagged-template 形式，例如：
  ```ts
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM messages`;
  ```
- 删除接口约定：`DELETE` 通过查询参数传递 id（例如 `/api/messages?id=123`），不要期待 body 中带 id（前端也按此约定实现）。

4) 本地开发与部署命令
- 本地开发：`npm run dev` （Next 默认 http://localhost:3000）。
- 构建：`npm run build`，生产启动：`npm start`。
- 必需环境变量（本地测试认证/DB）：`DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。

5) 集成点与易出错区域（AI agent 应注意）
- 修改 `app/lib/auth.ts` 可能影响所有 API 的鉴权；在变更前检查 `app/api/*` 中对 `getServerSession` 的调用。
- 数据库交互假定 `DATABASE_URL` 可用，且查询以 tagged-template 方式构造，避免用字符串拼接以免破坏格式或引入注入风险。
- 路由处理器与前端交互的约定（如 DELETE?id=）是约定而非标准，AI 修改后需同步更新前端调用。

6) 编辑/PR 建议（Agent 操作守则）
- 保持改动原子，修改 API 签名时同时更新前端调用位置（例如 `app/page.tsx`）。
- 若需新增 env var，请在 PR 描述中列出用途与运行示例。

如需我把 CI、部署（Vercel/Neon）或更多文件级示例补充进来，请告诉我要补充的区域或凭证信息的处理方式。

7) CI 与部署（可选，常见场景）
- 主流托管：推荐使用 Vercel（与 Next.js 原生兼容）。部署时请在 Vercel 项目的 Environment Variables 中添加 `DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET`。
- Neon：如果使用 Neon，请把 Neon 提供的连接串作为 `DATABASE_URL`（示例：`postgres://...`）。不要把连接串写入源码或前端环境。
- 部署注意事项：
   - 构建命令：`npm run build`，输出由 Next.js 管理。
   - 预览/分支部署：确保 Vercel 的 Preview 环境也配置了 `DATABASE_URL` 和 OAuth 凭证，否则与本地行为不同。
   - Server Components / Edge：本仓库使用 App Router（Server Components 默认），如果将特定 API 或中间件移到 Edge，请验证兼容性（例如 `neon` 客户端是否支持 Edge）。
- CI / GitHub Actions：如果你添加 CI，确保 job 在运行 `npm run build` 前注入所需的 env vars，且对敏感信息使用 GitHub Secrets。

如果你希望我把一个示例 `vercel.json`、GitHub Actions workflow 或一个部署检查脚本加入仓库，我可以接着创建这些文件。
