import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ label = 'Loading secure preview...' }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 text-sm font-semibold text-cyan-800">
      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
