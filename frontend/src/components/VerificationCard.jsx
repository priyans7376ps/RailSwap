'use client';

import { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { verifyTicket } from '../services/api';

export default function VerificationCard() {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return;
    
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await verifyTicket({ pnr_number: pnr.trim() });
      setResult(res?.data || res);
    } catch (err) {
      setError(err?.message || 'Verification failed. Please check the PNR and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card mx-auto max-w-lg p-6 md:p-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-950">Verify a Ticket</h3>
        <p className="mt-2 text-sm text-slate-500">
          Enter a PNR number to securely verify ticket authenticity against railway records.
        </p>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleVerify}>
        <input 
          className="field flex-1" 
          placeholder="Enter 10 digit PNR" 
          value={pnr}
          onChange={(e) => setPnr(e.target.value)}
          maxLength={10}
          required
        />
        <button 
          type="submit" 
          className="btn-primary shrink-0" 
          disabled={loading || !pnr.trim()}
        >
          {loading ? 'Checking...' : <><Search className="h-4 w-4" /> Verify</>}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 font-bold text-rose-900">Verification Failed</p>
          <p className="mt-1 text-sm text-rose-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-inner">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h4 className="mt-3 text-lg font-bold text-emerald-900">Valid Ticket</h4>
          <p className="mt-1 text-sm text-emerald-700">{result.message}</p>
          
          {result.ticket && (
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-4 text-left text-sm shadow-sm ring-1 ring-emerald-100">
              <div>
                <p className="text-xs font-semibold text-slate-400">Train</p>
                <p className="font-bold text-slate-900">{result.ticket.train_number}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Class</p>
                <p className="font-bold text-slate-900">{result.ticket.class_type}</p>
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-400">Route</p>
                <p className="font-bold text-slate-900">{result.ticket.source_station} to {result.ticket.destination_station}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400">Date</p>
                <p className="font-bold text-slate-900">{new Date(result.ticket.journey_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
