'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { getMessages, sendMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function ChatBox({ partner }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!partner?.id) return;
    
    const fetchMsgs = async () => {
      try {
        const res = await getMessages(partner.id);
        const fetched = res?.data?.messages || res?.messages || [];
        setMessages(fetched);
      } catch (err) {
        // Silent catch for demo
      } finally {
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };
    
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 5000); // Simple polling
    return () => clearInterval(interval);
  }, [partner?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !partner?.id || sending) return;

    setSending(true);
    const msgText = newMessage.trim();
    
    // Optimistic update
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, message: msgText, sender_id: user.id }]);
    setNewMessage('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);

    try {
      await sendMessage({ receiver_id: partner.id, message: msgText });
      // Will be refreshed by polling or next fetch
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId)); // revert on error
    } finally {
      setSending(false);
    }
  };

  if (!partner) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 font-bold text-cyan-800">
            {partner.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900">{partner.name}</h3>
              {partner.is_verified && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-slate-500">
              {partner.rating ? `Rating: ${Number(partner.rating).toFixed(1)}` : 'New user'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400">No messages yet. Say hi!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    isMe
                      ? 'rounded-tr-sm bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                      : 'rounded-tl-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-100'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-100 bg-white p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            className="field flex-1 !rounded-full"
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-700 text-white shadow-md transition hover:bg-cyan-800 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
