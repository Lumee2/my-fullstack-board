// app/api/messages/route.ts
import { neon } from '@neondatabase/serverless'; // ✅ 保留 neon 用于普通查询
import { getServerSession } from 'next-auth';
import { Pool } from '@neondatabase/serverless'; // ✅ 导入 Pool
import PgAdapter from '@auth/pg-adapter';
import GitHubProvider from 'next-auth/providers/github';

// ✅ 创建 Pool（用于 next-auth 适配器）
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// ✅ 内联 authOptions
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

// ✅ 保留 neon 用于普通 SQL 查询
const sql = neon(process.env.DATABASE_URL!);

async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      user_id INTEGER
    )
  `;
}

// 后续 API 函数不变...


export async function GET() {
  try {
    await initDB();
    const messages = await sql`
      SELECT m.*, u.name as user_name, u.image as user_image 
      FROM messages m 
      LEFT JOIN users u ON m.user_id = u.id 
      ORDER BY m.created_at DESC
    `;
    return Response.json(messages);
  } catch (error: any) {
    console.error('GET error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await initDB();
    const { text } = await request.json();
    const result = await sql`
      INSERT INTO messages (text, user_id) VALUES (${text}, ${session.user.id}) RETURNING *
    `;
    
    return Response.json(result[0]);
  } catch (error: any) {
    console.error('POST error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }
    
    await initDB();
    const check = await sql`
      SELECT user_id FROM messages WHERE id = ${id}
    `;
    
    if (check.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    
    if (check[0].user_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await sql`DELETE FROM messages WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
