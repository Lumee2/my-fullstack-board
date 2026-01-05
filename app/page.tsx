'use client';

// ✅ 完整的 import 语句（修正了 useState 未定义错误）
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

// ✅ 定义 Message 类型（修正了 user_id 字段名）
type Message = {
  id: number;
  text: string;
  created_at: string;
  user_name?: string;
  user_image?: string;
  user_id?: number; // 数据库字段名（Neon 返回的是 user_id）
};

export default function Home() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setError(null);
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (error: any) {
      console.error('Failed to fetch:', error);
      setError(`加载失败: ${error.message}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    if (!session) {
      alert('请先登录');
      return;
    }

    try {
      setError(null);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `POST ${res.status}`);
      }
      
      const newMessage = await res.json();
      setMessages(prev => [newMessage, ...prev]);
      setInput('');
    } catch (error: any) {
      console.error('Failed to create:', error);
      alert(`发布失败: ${error.message}`);
    }
  }

  async function handleDelete(id: number) {
    if (!session) {
      alert('请先登录');
      return;
    }

    const confirmed = window.confirm('确定要删除这条留言吗？');
    if (!confirmed) return;

    // ✅ 检查是否是用户自己的留言（注意 user_id 字段名）
    const message = messages.find(m => m.id === id);
    if (message?.user_id !== (session.user as any).id) {
      alert('只能删除自己的留言');
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`删除失败: ${error.message || '未知错误'}`);
    } finally {
      setDeletingId(null);
    }
  }

  // ✅ 处理加载状态（防止 useSession 未初始化）
  if (status === 'loading') {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      {/* 登录状态栏 */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">我的留言板</h1>
        {session ? (
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img src={session.user.image} alt={session.user.name || ''} className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm">{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              退出
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            GitHub 登录
          </button>
        )}
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>错误:</strong> {error}
        </div>
      )}
      
      {/* 发布表单（仅登录后显示） */}
      {session && (
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="写下你的留言..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            发布
          </button>
        </form>
      )}
      
      {!session && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          登录后才能发布留言
        </div>
      )}

      {/* 留言列表 */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">暂无留言</p>
        ) : (
          messages.map(msg => {
            const isOwner = session && msg.user_id === (session.user as any).id;
            return (
              <div key={msg.id} className="p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {msg.user_image && (
                      <img src={msg.user_image} alt={msg.user_name || ''} className="w-6 h-6 rounded-full inline-block mr-2" />
                    )}
                    <span className="font-semibold">{msg.user_name || '匿名'}</span>
                    <p className="text-gray-800 mt-1">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 min-w-[60px]"
                    >
                      {deletingId === msg.id ? '删除中...' : '删除'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
