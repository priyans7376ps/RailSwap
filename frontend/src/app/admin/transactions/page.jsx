'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListTransactions, adminUpdateTransactionStatus } from '../../../services/api';

export default function AdminTransactionsPage() {
  return (
    <RequireAdminAuth>
      <AdminTransactions />
    </RequireAdminAuth>
  );
}

function AdminTransactions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await adminListTransactions();
      const list = res?.data?.transactions || res?.transactions || res?.data || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (transactionId, field, newStatus) => {
    try {
      setProcessingId(transactionId);
      const payload = {};
      payload[field] = newStatus;
      await adminUpdateTransactionStatus(transactionId, payload);
      await fetchTransactions();
    } catch (e) {
      alert(e?.message || `Failed to update transaction`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Transactions</h1>
          <p className="mt-1 text-sm text-slate-400">View and manage all ticket exchange transactions.</p>
        </div>
      </div>

      {loading && transactions.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading transactions...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {(!loading || transactions.length > 0) && !error && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-slate-300">
            <div className="col-span-2">ID / Date</div>
            <div className="col-span-2">Ticket ID</div>
            <div className="col-span-2">Buyer / Seller</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {transactions.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No transactions found.</div>
            ) : (
              transactions.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-slate-200 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 font-semibold flex flex-col">
                    <span>TXN #{t.id}</span>
                    <span className="text-[10px] text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="col-span-2 text-slate-300">
                    <span className="text-cyan-400">#{t.ticket_id}</span>
                  </div>
                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span>B: #{t.buyer_id}</span>
                    <span>S: #{t.seller_id}</span>
                  </div>
                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span className="font-bold text-white">₹{t.amount}</span>
                    <span className="text-slate-400">Comm: ₹{t.platform_commission}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1 items-start">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.payment_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      t.payment_status === 'refunded' ? 'bg-amber-500/20 text-amber-300' :
                      t.payment_status === 'failed' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      Pay: {t.payment_status || 'pending'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.transaction_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      t.transaction_status === 'cancelled' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      Txn: {t.transaction_status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex items-center justify-end gap-2 flex-wrap">
                    <button 
                      onClick={() => handleAction(t.id, 'payment_status', 'refunded')}
                      disabled={processingId === t.id || t.payment_status === 'refunded'}
                      className="rounded-lg bg-amber-500/10 px-2 py-1.5 text-[10px] font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      Refund
                    </button>
                    <button 
                      onClick={() => handleAction(t.id, 'transaction_status', 'cancelled')}
                      disabled={processingId === t.id || t.transaction_status === 'cancelled'}
                      className="rounded-lg bg-rose-500/10 px-2 py-1.5 text-[10px] font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleAction(t.id, 'transaction_status', 'completed')}
                      disabled={processingId === t.id || t.transaction_status === 'completed'}
                      className="rounded-lg bg-emerald-500/10 px-2 py-1.5 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      Complete
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
