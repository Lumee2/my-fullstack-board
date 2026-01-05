// app/api/messages/route.ts
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';

const sql = neon(process.env.DATABASE_URL!);

// ✅ 只初始化 messages 表，NextAuth 表由 adapter 自动创建
async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      user_id INTEGER  -- ✅ 改为下划线命名
    )
  `;
}

export async function GET() {
  try {
    await initDB();
    // ✅ 使用 user_id 查询
    const messages = await sql`
      SELECT m.*, u.name as user_name, u.image as user_image 
      FROM messages m 
      LEFT JOIN users u ON m.user_id = u.id 
      ORDER BY m.created_at DESC
    `;
    return Response.json(messages);
  } catch (error: any) {
    console.error('GET error:', error);
    return Response.json({ error: 'Database error' }, { status: 500 });
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
    
    // ✅ 使用 user_id 插入
    const result = await sql`
      INSERT INTO messages (text, user_id) VALUES (${text}, ${session.user.id}) RETURNING *
    `;
    
    return Response.json(result[0]);
  } catch (error: any) {
    console.error('POST error:', error);
    return Response.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // ✅ 使用 URL 查询参数
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await initDB();
    
    // 检查是否是用户自己的留言
    const check = await sql`
      SELECT user_id FROM messages WHERE id = ${id}  -- ✅ user_id
    `;
    
    if (check.length === 0) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }
    
    // ✅ 检查 user_id（注意 Neon 返回的是 user_id 而非 userid）
    if (check[0].user_id !== session.user.id) {
      return Response.json({ error: 'Forbidden: Not your message' }, { status: 403 });
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
