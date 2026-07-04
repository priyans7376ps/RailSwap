'use client';

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-5xl font-bold text-slate-950">500</h1>
        <p className="mt-3 text-lg text-slate-600">Something went wrong</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          An unexpected error occurred. Our team has been notified and is working to resolve the issue.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => reset()} className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-cyan-200 hover:text-cyan-800">
            Go to homepage
          </a>
        </div>
      </div>
    </main>
  );
}
