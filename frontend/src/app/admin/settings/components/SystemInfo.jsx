'use client';

export default function SystemInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">System Information</h3>
        <p className="mt-1 text-sm text-slate-400">View diagnostic details and application versions.</p>
        
        <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-semibold text-slate-400">Application Version</span>
            <span className="text-sm font-bold text-white">v1.2.0</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-semibold text-slate-400">Backend Version</span>
            <span className="text-sm font-bold text-white">Flask-RESTful / 3.1.2</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-semibold text-slate-400">Frontend Version</span>
            <span className="text-sm font-bold text-white">Next.js 14 / React 18</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-semibold text-slate-400">Database Engine</span>
            <span className="text-sm font-bold text-white">SQLite (Dev)</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-semibold text-slate-400">Environment</span>
            <span className="text-sm font-bold text-emerald-400">Development</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-semibold text-slate-400">Server Time</span>
            <span className="text-sm font-bold text-white">{new Date().toISOString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-slate-400">Last Database Backup</span>
            <span className="text-sm font-bold text-slate-500">Not configured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
