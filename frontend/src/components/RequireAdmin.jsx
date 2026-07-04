'use client';

import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';

export default function RequireAdmin({ children }) {
  const { authLoading, user } = useAuth();

  useEffect(() => {
    // No redirects here; just gate content deterministically.
  }, []);

  if (authLoading) {
    return (
      <div className="page-shell py-10">
        <div className="rounded-[2rem] bg-slate-50 p-8 shadow-sm">
          <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  // Authenticated but non-admin => 403 Forbidden.
  if (!user || user?.role !== 'admin') {
    return (
      <div className="page-shell py-10">
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8">
          <h1 className="text-2xl font-bold text-rose-800">403 Forbidden</h1>
          <p className="mt-2 text-sm text-rose-700">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

