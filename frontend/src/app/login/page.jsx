'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { loginUser } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim().toLowerCase(), password });
      const token = res?.access_token || res?.data?.access_token;
      if (!token) throw new Error('Login failed. Please try again.');

      localStorage.setItem('access_token', token);
      await refreshUser();

      const next = searchParams.get('next') || '/dashboard';
      router.push(next);
    } catch (err) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
        <div className="premium-card w-full max-w-md p-6">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Login to RailSwap</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="label">Email</span>
              <input
                className="field"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="block space-y-2">
              <span className="label">Password</span>
              <input
                className="field"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" className="btn-secondary" disabled>
              <Mail className="h-4 w-4" /> Google
            </button>
            <button type="button" className="btn-secondary" disabled>
              <ShieldCheck className="h-4 w-4" /> SSO
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to RailSwap?{' '}
            <Link className="font-bold text-cyan-700" href="/signup">
              Create account
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-700" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
