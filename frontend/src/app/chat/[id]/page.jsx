'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { Send, ArrowLeft, Train, ShieldCheck, CheckCheck } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import RequireAuth from '../../../components/RequireAuth';
import { useAuth } from '../../../hooks/useAuth';
import { getConversationMessages, sendChatMessage } from '../../../services/api';

export default function ChatDetailPage({ params }) {
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;

  return (
    <RequireAuth>
      <ChatDetailContent conversationId={conversationId} />
    </RequireAuth>
  );
}

function ChatDetailContent({ conversationId }) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await getConversationMessages(conversationId);
      setConversation(res?.data?.conversation || res?.conversation);
      setMessages(res?.data?.messages || res?.messages || []);
    } catch (err) {
      setError(err?.message || 'Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) fetchMessages();
    const interval = setInterval(() => {
      if (conversationId) fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    setSending(true);
    setError('');
    const textToSend = inputMsg.trim();
    setInputMsg('');

    try {
      await sendChatMessage({ conversation_id: conversationId, message: textToSend });
      fetchMessages();
    } catch (err) {
      setError(err?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell py-6 max-w-4xl">
        <div className="mb-4">
          <Link href="/chat" className="text-sm font-semibold text-cyan-700 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Messages
          </Link>
        </div>

        {/* Chat Header */}
        <div className="premium-card p-4 flex items-center justify-between rounded-b-none border-b-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-100 font-bold text-cyan-800">
              {conversation?.other_user?.name?.[0] || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{conversation?.other_user?.name || 'Swap Partner'}</h3>
              {conversation?.ticket && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Train className="h-3 w-3 text-cyan-600" /> PNR {conversation.ticket.pnr_number}: {conversation.ticket.source_station} → {conversation.ticket.destination_station}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="border border-slate-200 bg-slate-50/50 p-6 min-h-[420px] max-h-[500px] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No messages yet. Send a message to start communicating with your swap partner!
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isMine
                        ? 'bg-cyan-700 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.message}</p>
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-cyan-100' : 'text-slate-400'}`}>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && <CheckCheck className={`h-3 w-3 ${m.is_read ? 'text-emerald-300' : 'opacity-60'}`} />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="premium-card p-3 rounded-t-none border-t-0 flex items-center gap-2">
          <input
            className="field text-xs flex-1 border-0 bg-slate-50 focus:bg-white"
            placeholder="Type your message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !inputMsg.trim()}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </form>
      </main>
    </>
  );
}
