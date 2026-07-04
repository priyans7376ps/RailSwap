import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ title = 'Something needs attention', message }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-5 w-5" />
        {title}
      </div>
      {message && <p className="mt-2 text-sm text-rose-700">{message}</p>}
    </div>
  );
}
