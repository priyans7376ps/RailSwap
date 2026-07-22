'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldAlert, ShieldCheck, UploadCloud } from 'lucide-react';
import { verifyTicket } from '../services/api';

export default function VerificationCard() {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePnrFormat = (val) => /^\d{10}$/.test(val.trim());

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanPnr = pnr.trim();

    if (!cleanPnr || !validatePnrFormat(cleanPnr)) {
      setError('Invalid PNR number.');
      setResult(null);
      return;
    }
    
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await verifyTicket({ pnr: cleanPnr });
      if (res && res.verified) {
        setResult(res);
      } else {
        setError(res?.message || 'Invalid PNR number.');
      }
    } catch (err) {
      setError(err?.message || 'Invalid PNR number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card mx-auto max-w-lg p-6 md:p-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-950">Verify a Ticket</h3>
        <p className="mt-2 text-sm text-slate-500">
          Enter a 10-digit PNR number to verify live railway status via RapidAPI.
        </p>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleVerify}>
        <input 
          className="field flex-1" 
          placeholder="Enter 10-digit PNR" 
          value={pnr}
          onChange={(e) => {
            setPnr(e.target.value);
            setResult(null);
            setError('');
          }}
          maxLength={10}
          required
        />
        <button 
          type="submit" 
          className="btn-primary shrink-0" 
          disabled={loading || !pnr.trim()}
        >
          {loading ? 'Verifying...' : <><Search className="h-4 w-4" /> Verify</>}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 font-bold text-rose-900">Verification Failed</p>
          <p className="mt-1 text-sm text-rose-600">{error}</p>

          <div className="mt-5 pt-4 border-t border-rose-200">
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-400"
            >
              Upload Ticket (Disabled)
            </button>
            <p className="mt-2 text-xs text-rose-500">PNR must be verified before uploading ticket.</p>
          </div>
        </div>
      )}

      {result && result.verified && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-inner">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>✓ Verified</span>
          </div>

          <p className="mt-2 text-xs text-emerald-700 font-medium">{result.message}</p>
          
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-4 text-left text-sm shadow-sm ring-1 ring-emerald-100">
            <div>
              <p className="text-xs font-semibold text-slate-400">Train Number</p>
              <p className="font-bold text-slate-900">{result.train_number}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Train Name</p>
              <p className="font-bold text-slate-900">{result.train_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Source</p>
              <p className="font-bold text-slate-900">{result.source}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Destination</p>
              <p className="font-bold text-slate-900">{result.destination}</p>
            </div>
            <div className="col-span-2 border-t border-slate-100 pt-2">
              <p className="text-xs font-semibold text-slate-400">Journey Date</p>
              <p className="font-bold text-slate-900">{result.journey_date}</p>
            </div>
          </div>

          <div className="mt-6">
            <Link 
              href={`/upload-ticket?pnr=${encodeURIComponent(result.pnr)}&verified=true`}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3"
            >
              <UploadCloud className="h-4 w-4" /> Upload Ticket
            </Link>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-400"
          >
            Upload Ticket (Requires PNR Verification)
          </button>
        </div>
      )}
    </div>
  );
}
