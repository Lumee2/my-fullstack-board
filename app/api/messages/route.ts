// app/api/messages/route.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

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

// 将 ID 从 URL 查询参数读取，而不是 body
export async function DELETE(request: Request) {
  try {
    // ✅ 从 URL 查询参数读取 ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await initDB();
    
    // 检查记录是否存在
    const check = await sql`SELECT 1 FROM messages WHERE id = ${id}`;
    if (check.length === 0) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }
    
    await sql`DELETE FROM messages WHERE id = ${id}`;
    
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return Response.json({ 
      error: error.message || 'Failed to delete message',
      details: error.toString() 
    }, { status: 500 });
  }
}

