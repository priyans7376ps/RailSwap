'use client';

import { useEffect, useState } from 'react';

export default function AdminNavbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    setIsSignedIn(!!localStorage.getItem('access_token'));
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-4 md:px-8">
      <div>
        <p className="text-sm font-semibold text-slate-400">Overview</p>
        <h2 className="text-xl font-extrabold text-white">Admin Console</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 md:flex">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <p className="text-xs font-semibold text-slate-200">RBAC Enabled</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-xs font-bold text-slate-200">{isSignedIn ? 'Signed in' : 'Guest'}</p>
        </div>
      </div>
    </div>
  );
}
