'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListTransactions, adminUpdateTransactionStatus } from '../../../services/api';
import { Search, Filter, ShieldCheck, Eye } from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.payment_status === statusFilter;
    const q = searchQuery.toLowerCase().strip ? searchQuery.toLowerCase().strip() : searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      String(t.id).includes(q) ||
      String(t.ticket_id).includes(q) ||
      (t.buyer?.name || '').toLowerCase().includes(q) ||
      (t.seller?.name || '').toLowerCase().includes(q) ||
      (t.ticket?.pnr_number || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Transactions Management</h1>
          <p className="mt-1 text-sm text-slate-400">Escrow status oversight, payment hold monitoring & dispute controls.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, PNR, User..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white/10 text-xs text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="payment_held">Payment Held (Escrow)</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {loading && transactions.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading system transactions...
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
            <div className="col-span-3">Ticket / PNR</div>
            <div className="col-span-2">Buyer / Seller</div>
            <div className="col-span-2">Amount (Escrow)</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {filteredTransactions.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No transactions match your search filter.</div>
            ) : (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-slate-200 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 font-semibold flex flex-col">
                    <span>TXN #{t.id}</span>
                    <span className="text-[10px] text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  
                  <div className="col-span-3 text-slate-300 flex flex-col text-xs">
                    <span className="text-cyan-400 font-bold">PNR: {t.ticket?.pnr_number || `#${t.ticket_id}`}</span>
                    <span className="text-slate-400">{t.ticket?.source_station} → {t.ticket?.destination_station}</span>
                  </div>

                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span>B: {t.buyer?.name || `#${t.buyer_id}`}</span>
                    <span>S: {t.seller?.name || `#${t.seller_id}`}</span>
                  </div>

                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span className="font-bold text-white">₹{t.amount}</span>
                    <span className="text-slate-400">Fee: ₹{t.platform_fee || t.platform_commission}</span>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      t.payment_status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      t.payment_status === 'payment_held' ? 'bg-amber-500/20 text-amber-300' :
                      t.payment_status === 'failed' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {t.payment_status === 'payment_held' ? 'Held' : (t.payment_status || 'pending')}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <a
                      href={`/transactions/${t.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Inspect
                    </a>
                    <button 
                      onClick={() => handleAction(t.id, 'payment_status', 'refunded')}
                      disabled={processingId === t.id || t.payment_status === 'refunded'}
                      className="rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Refund
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
