import Link from 'next/link';
import { Mail, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
        <AuthCard mode="login" />
      </main>
    </>
  );
}

function AuthCard() {
  return (
    <div className="premium-card w-full max-w-md p-6">
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">Login to RailSwap</h1>
      <form className="mt-6 space-y-4">
        <Field label="Email" placeholder="you@example.com" type="email" />
        <Field label="Password" placeholder="Enter password" type="password" />
        <p className="text-xs font-semibold text-cyan-700">Validation UI: enter a valid email and password to continue.</p>
        <button className="btn-primary w-full">Login</button>
      </form>
      <Social />
      <p className="mt-6 text-center text-sm text-slate-500">
        New to RailSwap? <Link className="font-bold text-cyan-700" href="/signup">Create account</Link>
      </p>
    </div>
  );
}

function Field({ label, ...props }) {
  return <label className="block space-y-2"><span className="label">{label}</span><input className="field" {...props} /></label>;
}

function Social() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button className="btn-secondary"><Mail className="h-4 w-4" /> Google</button>
      <button className="btn-secondary"><ShieldCheck className="h-4 w-4" /> SSO</button>
    </div>
  );
}
