'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListPayments, adminUpdateTransactionStatus } from '../../../services/api';

export default function AdminPaymentsPage() {
  return (
    <RequireAdminAuth>
      <AdminPayments />
    </RequireAdminAuth>
  );
}

function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminListPayments();
      const list = res?.data?.payments || res?.payments || res?.data || [];
      setPayments(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleStatusChange = async (transactionId, newStatus) => {
    try {
      setProcessingId(transactionId);
      await adminUpdateTransactionStatus(transactionId, { payment_status: newStatus });
      await fetchPayments();
    } catch (e) {
      alert(e?.message || 'Failed to update payment');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Payments</h1>
          <p className="mt-1 text-sm text-slate-400">Manage all platform payments and refunds.</p>
        </div>
      </div>

      {loading && payments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading payments...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {(!loading || payments.length > 0) && !error && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-slate-300">
            <div className="col-span-2">TXN ID</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {payments.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No payments found.</div>
            ) : (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-slate-200 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 font-semibold flex flex-col">
                    <span>#{p.id}</span>
                  </div>
                  <div className="col-span-3 text-slate-300">
                    {p.created_at ? new Date(p.created_at).toLocaleString() : '-'}
                  </div>
                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span className="font-bold text-white text-sm">₹{p.amount}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1 items-start">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.payment_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      p.payment_status === 'refunded' ? 'bg-amber-500/20 text-amber-300' :
                      p.payment_status === 'failed' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {p.payment_status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="col-span-3 flex items-center justify-end gap-2 flex-wrap">
                    <button 
                      onClick={() => handleStatusChange(p.id, 'refunded')}
                      disabled={processingId === p.id || p.payment_status === 'refunded'}
                      className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      Issue Refund
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
