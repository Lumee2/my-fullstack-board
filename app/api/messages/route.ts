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
// DELETE：删除留言
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await initDB();
    await sql`DELETE FROM messages WHERE id = ${id}`;
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return Response.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
