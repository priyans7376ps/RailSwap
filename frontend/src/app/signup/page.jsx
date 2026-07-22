'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { registerUser } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      const token = res?.access_token || res?.data?.access_token;
      if (!token) throw new Error('Registration failed. Please try again.');

      localStorage.setItem('access_token', token);
      await refreshUser();

      const next = searchParams.get('next') || '/dashboard';
      router.push(next);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
        <div className="premium-card w-full max-w-md p-6">
          <p className="eyebrow">Get started</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Create your RailSwap account</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="label">Full name</span>
              <input
                className="field"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
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
              <div className="relative">
                <input
                  className="field pr-10"
                  placeholder="Create a strong password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <p className="text-xs text-slate-500">
              Password must be at least 8 characters long.
            </p>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
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
            Already registered?{' '}
            <Link className="font-bold text-cyan-700" href="/login">
              Login
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-700" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
