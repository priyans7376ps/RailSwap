'use client';

import Link from 'next/link';

import { LogOut } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

export default function AuthLinks() {
  const { user, authLoading, signOut } = useAuth();

  if (authLoading) {
    // Deterministic fallback to avoid SSR/CSR auth flips.
    return (
      <div className="h-9 w-[180px] rounded-full bg-slate-100/70 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="btn-secondary py-2.5">
          Login
        </Link>
        <Link href="/signup" className="btn-primary py-2.5">
          Join RailSwap
        </Link>
      </>
    );
  }

  return (
    <button
      type="button"
      className="btn-secondary py-2.5 inline-flex items-center gap-2"
      onClick={() => signOut()}
    >
      <LogOut className="h-4 w-4" />
      <span className="font-semibold">{user?.name || 'User'}</span>
      <span>Logout</span>
    </button>
  );
}




