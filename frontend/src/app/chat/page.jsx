'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, User, Clock, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RequireAuth from '../../components/RequireAuth';
import { getConversations } from '../../services/api';

export default function ChatListPage() {
  return (
    <RequireAuth>
      <ChatListContent />
    </RequireAuth>
  );
}

function ChatListContent() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getConversations();
        setConversations(res?.data?.conversations || res?.conversations || []);
      } catch (err) {
        setError(err?.message || 'Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Messages</h1>
            <p className="mt-1 text-sm text-slate-500">
              Direct chat communication between ticket buyers and sellers.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 py-16 text-center text-slate-500 font-medium">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-slate-900">No messages yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              When you send or receive exchange requests, chat conversations will appear here.
            </p>
            <Link href="/search-ticket" className="btn-primary mt-4 inline-block text-xs py-2 px-4">
              Browse Available Tickets
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3 max-w-3xl">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="premium-card p-5 flex items-center justify-between hover:bg-slate-50/80 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan-100 font-bold text-cyan-800 text-lg">
                    {c.other_user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{c.other_user?.name || 'User'}</h4>
                      {c.unread_count > 0 && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                          {c.unread_count} new
                        </span>
                      )}
                    </div>
                    {c.ticket && (
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        PNR {c.ticket.pnr_number}: {c.ticket.source_station} → {c.ticket.destination_station}
                      </p>
                    )}
                    {c.last_message && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {c.last_message.message}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
