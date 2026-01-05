// app/api/messages/route.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 初始化数据库表（如果不存在）
async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

// GET：获取所有留言（按时间倒序）
export async function GET() {
  try {
    await initDB();
    const messages = await sql`SELECT * FROM messages ORDER BY created_at DESC`;
    return Response.json(messages);
  } catch (error) {
    console.error('GET error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST：创建新留言
export async function POST(request: Request) {
  try {
    await initDB();
    const { text } = await request.json();
    const result = await sql`
      INSERT INTO messages (text) VALUES (${text}) RETURNING *
    `;
    return Response.json(result[0]);
  } catch (error) {
    console.error('POST error:', error);
    return Response.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
