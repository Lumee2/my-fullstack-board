// app/api/auth/[...nextauth]/route.ts（修正版）
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { Pool } from '@neondatabase/serverless';
import PgAdapter from '@auth/pg-adapter'; 

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const authOptions = {
  adapter: PgAdapter(pool),
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
