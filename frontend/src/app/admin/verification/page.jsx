'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListVerifications, adminUpdateTicketStatus } from '../../../services/api';

export default function AdminVerificationPage() {
  return (
    <RequireAdminAuth>
      <AdminVerifications />
    </RequireAdminAuth>
  );
}

function AdminVerifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifications, setVerifications] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await adminListVerifications();
      const list = res?.data?.verifications || res?.verifications || res?.data || [];
      setVerifications(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (ticketId, action) => {
    try {
      setProcessingId(ticketId);
      const status = action === 'approve' ? 'verified' : 'rejected';
      await adminUpdateTicketStatus(ticketId, { verification_status: status });
      await fetchVerifications();
    } catch (e) {
      alert(e?.message || `Failed to ${action} ticket`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Verification Panel</h1>
          <p className="mt-1 text-sm text-slate-400">Review pending ticket verification requests.</p>
        </div>
      </div>

      {loading && verifications.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading verifications...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {(!loading || verifications.length > 0) && !error && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-slate-300">
            <div className="col-span-2">PNR / ID</div>
            <div className="col-span-2">User ID</div>
            <div className="col-span-3">Route</div>
            <div className="col-span-2">Date / Train</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {verifications.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No pending verifications. Great job!</div>
            ) : (
              verifications.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-2 px-4 py-4 text-sm text-slate-200 items-start hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 font-semibold flex flex-col">
                    <span>{t.pnr || '-'}</span>
                    <span className="text-[10px] text-slate-400">Ticket #{t.id}</span>
                  </div>
                  <div className="col-span-2 truncate text-slate-300">User #{t.user_id}</div>
                  <div className="col-span-3 text-slate-300 flex flex-col text-xs">
                    <span>From: {t.source_station}</span>
                    <span>To: {t.destination_station}</span>
                  </div>
                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span>{t.travel_date ? new Date(t.travel_date).toLocaleDateString() : '-'}</span>
                    <span className="text-slate-400">{t.train_number} - {t.class_type}</span>
                  </div>
                  
                  <div className="col-span-3 flex items-center justify-end gap-2 flex-wrap">
                    <button 
                      onClick={() => handleAction(t.id, 'approve')}
                      disabled={processingId === t.id}
                      className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(t.id, 'reject')}
                      disabled={processingId === t.id}
                      className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                  
                  {/* Additional info like file url if present */}
                  {t.file_url && (
                    <div className="col-span-12 mt-2 p-2 bg-black/20 rounded-lg text-xs">
                      <a href={t.file_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                        View Uploaded Ticket File
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
