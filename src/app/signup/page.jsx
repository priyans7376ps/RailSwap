import Link from 'next/link';
import { Mail, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell grid min-h-[calc(100vh-80px)] place-items-center py-12">
        <div className="premium-card w-full max-w-md p-6">
          <p className="eyebrow">Get started</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Create your RailSwap account</h1>
          <form className="mt-6 space-y-4">
            <Field label="Full name" placeholder="Priya Sharma" />
            <Field label="Email" placeholder="you@example.com" type="email" />
            <Field label="Password" placeholder="Create password" type="password" />
            <p className="text-xs font-semibold text-emerald-700">Validation UI: strong password, verified phone and email checks will connect in Phase 2.</p>
            <button className="btn-primary w-full">Create account</button>
          </form>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="btn-secondary"><Mail className="h-4 w-4" /> Google</button>
            <button className="btn-secondary"><ShieldCheck className="h-4 w-4" /> SSO</button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered? <Link className="font-bold text-cyan-700" href="/login">Login</Link>
          </p>
        </div>
      </main>
    </>
  );
}

function Field({ label, ...props }) {
  return <label className="block space-y-2"><span className="label">{label}</span><input className="field" {...props} /></label>;
}
