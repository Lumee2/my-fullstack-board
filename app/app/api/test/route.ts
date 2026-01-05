// app/api/test/route.ts
export async function GET() {
  return Response.json({ 
    message: 'API 正常工作！',
    time: new Date().toISOString(),
    env: process.env.DATABASE_URL ? 'DATABASE_URL 已配置' : 'DATABASE_URL 缺失'
  });
}
