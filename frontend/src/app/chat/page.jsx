'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ChatBox from '../../components/ChatBox';
import RequireAuth from '../../components/RequireAuth';
import { getMatches } from '../../services/api';

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatContent />
    </RequireAuth>
  );
}

function ChatContent() {
  // In a real app, this page would list conversations.
  // For now, we'll fetch matches to find potential chat partners
  // and pass the first match's owner to the ChatBox.
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMatches();
        const tickets = res?.data?.tickets || res?.tickets || [];
        if (tickets.length > 0 && tickets[0].owner) {
          setPartner(tickets[0].owner);
        }
      } catch (err) {
        console.error('Failed to load chat partners');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <p className="eyebrow">Secure messaging</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Inbox</h1>

        <div className="mt-8 grid h-[600px] rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[300px_1fr] overflow-hidden">
          <div className="hidden border-r border-slate-100 bg-slate-50/50 p-4 lg:block overflow-y-auto">
            <h2 className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Recent conversations</h2>
            
            {loading ? (
              <div className="mt-4 p-2 text-sm text-slate-500">Loading...</div>
            ) : partner ? (
              <div className="mt-4 flex cursor-pointer gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 font-bold text-cyan-800">
                  {partner.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-bold text-slate-900">{partner.name}</p>
                    <span className="text-[10px] font-medium text-slate-400">Just now</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">Select to view messages</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-2 text-sm text-slate-500">No active conversations.</div>
            )}
          </div>
          
          <div className="relative flex flex-col bg-slate-50/30">
            {partner ? (
              <ChatBox partner={partner} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500">
                {loading ? 'Loading...' : 'Select a conversation to start chatting'}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
