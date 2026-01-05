'use client';

import { useState, useEffect } from 'react';
import { authOptions } from './lib/auth';

type Message = {
  id: number;
  text: string;
  created_at: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null); // ✅ 定义 setError

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

    try {
      setError(null);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      
      if (!res.ok) throw new Error(`POST ${res.status}`);
      const newMessage = await res.json();
      
      setMessages(prev => [newMessage, ...prev]);
      setInput('');
    } catch (error: any) {
      console.error('Failed to create:', error);
      alert(`发布失败: ${error.message}`);
    }
  }

async function handleDelete(id: number) {
  const confirmed = window.confirm('确定要删除这条留言吗？');
  if (!confirmed) return;

  setDeletingId(id);

  try {
    // ✅ 改用 URL 查询参数传递 ID
    const res = await fetch(`/api/messages?id=${id}`, {
      method: 'DELETE',
      headers: { 
        'Accept': 'application/json'
      },
      // ✅ 删除 body，不再发送 JSON
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


  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">我的留言板</h1>
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>错误:</strong> {error}
        </div>
      )}
      
      {/* 发布表单 */}
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

      {/* 留言列表 */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">暂无留言</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-800">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(msg.id)}
                disabled={deletingId === msg.id}
                className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 min-w-[60px]"
              >
                {deletingId === msg.id ? '删除中...' : '删除'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
