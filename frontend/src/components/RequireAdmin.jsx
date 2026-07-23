'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function RequireAdmin({ children }) {
  const { authLoading, user, refreshUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshUser().finally(() => {
      setChecking(false);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="page-shell py-10">
        <div className="rounded-[2rem] bg-slate-900/50 p-8 shadow-sm border border-white/10">
          <div className="h-6 w-56 animate-pulse rounded bg-slate-700" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-700" />
        </div>
      </div>
    );
  }

  const storedPayload = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('access_token_payload') || 'null')
    : null;

  const isAdmin = user?.role === 'admin' || storedPayload?.role === 'admin';

  if (authLoading && checking && !isAdmin) {
    return (
      <div className="page-shell py-10">
        <div className="rounded-[2rem] bg-slate-900/50 p-8 shadow-sm border border-white/10">
          <div className="h-6 w-56 animate-pulse rounded bg-slate-700" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-700" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-shell py-10">
        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-200">
          <h1 className="text-2xl font-bold text-rose-400">403 Forbidden</h1>
          <p className="mt-2 text-sm text-slate-300">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
