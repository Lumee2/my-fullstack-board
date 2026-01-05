// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import PgAdapter from '@auth/pg-adapter';
import { Pool } from '@neondatabase/serverless'; // ✅ 导入 Pool

// ✅ 创建 Pool 实例（类型正确）
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const authOptions = {
  adapter: PgAdapter(pool), // ✅ 使用 Pool
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      session.user.id = user.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
