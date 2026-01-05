// app/api/messages/route.ts
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
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
