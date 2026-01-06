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

8) 常用代码片段（便于快速开始）

- 服务端 Route Handler（鉴权 + neon 示例）：

```ts
// app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import neon from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  const { text } = await req.json();
  const rows = await sql`INSERT INTO messages (text, user_id) VALUES (${text}, ${session.user.id}) RETURNING *`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new NextResponse('Missing id', { status: 400 });

  const owner = await sql`SELECT user_id FROM messages WHERE id = ${id}`;
  if (!owner.length || owner[0].user_id !== session.user.id) return new NextResponse('Forbidden', { status: 403 });

  await sql`DELETE FROM messages WHERE id = ${id}`;
  return new NextResponse(null, { status: 204 });
}
```

- 客户端调用示例（`use client` 组件内）：

```ts
// 发布
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'hello' }),
});

// 删除（约定：id 通过查询参数传递）
await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
```

- 要点：先在服务端路由校验 session，使用 `neon` 的 tagged-template，DELETE 使用 `?id=` 约定。

---

如果你需要，我可以把上面的内容替换回 `.github/copilot-instructions.md` 或直接在 README 中追加部署/Secrets 步骤。
