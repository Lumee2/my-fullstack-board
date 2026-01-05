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

4. 代码风格与约定
   - 页面默认为服务端组件；仅在需要浏览器 API / 状态管理时添加 `use client`（示例：`app/page.tsx`）。
   - 使用 TypeScript 且项目结构简洁，请保持类型显式（尤其在 session、request、response 处）。
   - 全局样式在 `app/globals.css`（Tailwind 通过 postcss 已集成），请在修改样式时注意兼容暗色模式变量。 

5. 常见开发任务示例
   - 调用留言列表：客户端 fetch `/api/messages`（`GET`）并展示返回的数组（参见 `app/page.tsx`）。
   - 发布留言：客户端 POST 到 `/api/messages`，请求 body 为 JSON `{ text }`，服务器会把 session.user.id 作为 `user_id` 插入数据库。
   - 删除留言：客户端发 `DELETE /api/messages?id=123`；路由会校验当前 session.user.id 是否与消息的 `user_id` 匹配。

6. 安全与边界
   - 所有写操作依赖 `next-auth` 的 session；在服务端路由中务必先校验 session 再执行 DB 操作。
   - 不要在前端暴露 `DATABASE_URL` 或任何密钥；仅在服务端环境变量中配置。

7. 如果本文件已存在（合并策略）
   - 保留已有的项目特定提示；把新的“实现细节”/“运行与调试”小节合并入文件顶部的 Summary 区域，避免重复。

如果有不完整或不准确的部分，请指出需要补充的区域（例如：CI、部署细节或额外环境变量），我将迭代更新此文件。
