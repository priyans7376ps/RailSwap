'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import AdminNavbar from '../../../components/admin/AdminNavbar';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const payload = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('access_token_payload') || 'null') : null;
    if (payload?.role === 'admin') router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <AdminNavbar />
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div>
          <p className="eyebrow">Admin Portal</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Login</h1>
          <p className="mt-2 text-sm text-slate-400">
            Premium, RBAC-protected dashboard.
          </p>
        </div>

        <form
          className="premium-card flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);

            try {
              const res = await adminLogin({ email: 'singh876580@gmail.com', password });
              const token = res?.access_token || res?.data?.access_token || res?.data?.data?.access_token;
              if (!token) throw new Error('Access token missing');

              localStorage.setItem('access_token', token);
              const payload = getDecodedJwtPayload(token);
              localStorage.setItem('access_token_payload', JSON.stringify(payload));
              await refreshUser();

              router.push('/admin/dashboard');
            } catch (err) {
              const msg = err?.message || err?.raw?.message || err?.raw?.error;
              setError(msg === 'Access Denied' ? 'Access Denied' : (msg || 'Login failed'));
            } finally {
              setLoading(false);
            }
          }}
        >

          <label className="block space-y-2">
            <span className="label">Password</span>
            <div className="relative">
              <input
                className="field pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-3 text-sm font-semibold text-rose-200">
              {error}
            </div>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-xs text-slate-500">
            <Link className="font-bold text-cyan-300" href="/login">
              Back to user login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function getDecodedJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
