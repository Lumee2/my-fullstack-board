// app/page.tsx
'use client'; // 告诉 Next.js 这是客户端组件（可以用 React 的 useState）

import { useState, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ id: number; text: string; createdAt: string }[]>([]);
  const [input, setInput] = useState('');

  // 页面加载时，从后端获取留言
  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // 提交新留言
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });
    const newMessage = await res.json();
    
    setMessages(prev => [...prev, newMessage]); // 刷新列表
    setInput(''); // 清空输入框
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">我的留言板</h1>
      
      {/* 表单 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="写下你的留言..."
          className="w-full p-3 border rounded-lg"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          发布
        </button>
      </form>

      {/* 留言列表 */}
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-800">{msg.text}</p>
            <p className="text-xs text-gray-500 mt-2">{msg.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
