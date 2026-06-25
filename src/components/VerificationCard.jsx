'use client';

import { BadgeCheck, ShieldX } from 'lucide-react';
import { useVerificationDemo } from '../hooks/useVerificationDemo';
import LoadingState from './LoadingState';

export default function VerificationCard() {
  const { status, verify } = useVerificationDemo();

  return (
    <div className="premium-card max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-slate-950">Verify Your Train Ticket</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Enter a PNR number to preview RailSwap's frontend verification workflow.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          verify(new FormData(event.currentTarget).get('pnr'));
        }}
      >
        <label className="block space-y-2">
          <span className="label">PNR Number</span>
          <input name="pnr" className="field" placeholder="Enter 10 digit PNR" />
        </label>
        <button className="btn-primary w-full">Run verification</button>
      </form>

      <div className="mt-6">
        {status === 'loading' && <LoadingState label="Checking PNR, route, date and passenger criteria..." />}
        {status === 'success' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <BadgeCheck className="h-5 w-5" />
              Ticket verification successful
            </div>
            <p className="mt-2 text-sm text-emerald-700">The ticket can be listed with a verified badge after document review.</p>
          </div>
        )}
        {status === 'failed' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
            <div className="flex items-center gap-2 font-bold">
              <ShieldX className="h-5 w-5" />
              Verification failed
            </div>
            <p className="mt-2 text-sm text-rose-700">Please check the PNR format or try another ticket record.</p>
          </div>
        )}
      </div>
    </div>
  );
}
