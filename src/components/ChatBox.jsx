import { Bell, Send } from 'lucide-react';
import { conversations } from '../utils/dummyData';

export default function ChatBox() {
  return (
    <div className="premium-card grid overflow-hidden lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-950">Messages</h2>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 text-cyan-800">
            <Bell className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {conversations.map((chat) => (
            <div key={chat.name} className={`rounded-2xl p-4 ${chat.active ? 'bg-white shadow-sm ring-1 ring-cyan-100' : 'bg-transparent'}`}>
              <p className="font-semibold text-slate-900">{chat.name}</p>
              <p className="mt-1 truncate text-sm text-slate-500">{chat.preview}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[520px] flex-col">
        <div className="border-b border-slate-200 p-5">
          <p className="font-bold text-slate-950">Nikhil Verma</p>
          <p className="text-sm text-emerald-700">Verified buyer · payment intent created</p>
        </div>
        <div className="flex-1 space-y-4 p-5">
          <Bubble align="left" text="Hi Priya, is this ticket still available for the same boarding point?" />
          <Bubble align="right" text="Yes, boarding from New Delhi. RailSwap verification is complete." />
          <Bubble align="left" text="Great. I can proceed once the escrow screen opens." />
        </div>
        <form className="flex gap-3 border-t border-slate-200 p-4">
          <input className="field" placeholder="Write a message..." />
          <button className="btn-primary px-4" aria-label="Send message">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}

function Bubble({ align, text }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <p className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-6 ${align === 'right' ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
        {text}
      </p>
    </div>
  );
}
