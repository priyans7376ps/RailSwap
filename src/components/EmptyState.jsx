import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No items yet', message = 'New activity will appear here.' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center">
      <Inbox className="mx-auto h-8 w-8 text-slate-400" />
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
