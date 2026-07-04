'use client';

import Link from 'next/link';


import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function RequireAuth({ children, redirectTo = '/login' }) {
  const router = useRouter();

  const { authLoading, user } = useAuth();


  const getNextParam = () => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname + window.location.search;
  };




  if (authLoading) {
    // Deterministic placeholder to prevent hydration flips.
    return (
      <div className="page-shell py-10">
        <div className="rounded-[2rem] bg-slate-50 p-8 shadow-sm">
          <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-80 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Professional UX: show a modal to let the guest choose what to do.
    // (Requirement: “Please login to continue.”)
    const next = encodeURIComponent(getNextParam());
    const loginHref = `${redirectTo}?next=${next}&reason=login_required`;
    const signupHref = `/signup?next=${next}&reason=login_required`;

    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-800">🔒</div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Please login to continue.</h2>
              <p className="mt-1 text-sm text-slate-600">
                You must be signed in to access this feature.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Link
              href={loginHref}
              className="btn-primary flex-1 text-center"
            >
              Login
            </Link>
            <Link
              href={signupHref}
              className="btn-secondary flex-1 text-center"
            >
              Signup
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                // Cancel: stay on the current page.
                // In this prototype we simply reload the current route.
                router.refresh();
              }}
            >
              Cancel
            </button>

          </div>
        </div>
      </div>
    );
  }


  return children;
}

