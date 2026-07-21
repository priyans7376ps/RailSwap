'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListTickets, adminUpdateTicketStatus, adminDeleteTicket } from '../../../services/api';

export default function AdminTicketsPage() {
  return (
    <RequireAdminAuth>
      <AdminTickets />
    </RequireAdminAuth>
  );
}

function AdminTickets() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await adminListTickets();
      const list = res?.data?.tickets || res?.tickets || res?.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, statusType, newStatus) => {
    try {
      setProcessingId(ticketId);
      const payload = {};
      payload[statusType] = newStatus;
      await adminUpdateTicketStatus(ticketId, payload);
      await fetchTickets();
    } catch (e) {
      alert(e?.message || 'Failed to update ticket');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (ticketId) => {
    try {
      setProcessingId(ticketId);
      await adminDeleteTicket(ticketId);
      await fetchTickets();
    } catch (e) {
      alert(e?.message || 'Failed to delete ticket');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tickets</h1>
          <p className="mt-1 text-sm text-slate-400">Manage all tickets on the platform.</p>
        </div>
      </div>

      {loading && tickets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading tickets...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {(!loading || tickets.length > 0) && !error && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-slate-300">
            <div className="col-span-2">PNR</div>
            <div className="col-span-3">Route</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Verification</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {tickets.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No tickets found.</div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-200 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 truncate font-semibold">{t.pnr_number || `ID: ${t.id}`}</div>
                  <div className="col-span-3 truncate text-slate-300">{t.source_station} ➔ {t.destination_station}</div>
                  <div className="col-span-1 truncate text-slate-400 text-xs">{t.journey_date ? new Date(t.journey_date).toLocaleDateString() : '-'}</div>
                  <div className="col-span-1 text-slate-300 font-bold">₹{t.exchange_price}</div>
                  <div className="col-span-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.ticket_status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}`}>
                      {t.ticket_status || 'unknown'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.verification_status === 'verified' ? 'bg-emerald-500/20 text-emerald-300' :
                      t.verification_status === 'invalid' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {t.verification_status || 'pending'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2 flex-wrap">
                    <button 
                      onClick={() => handleStatusChange(t.id, 'status', t.ticket_status === 'active' ? 'cancelled' : 'active')}
                      disabled={processingId === t.id}
                      className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-semibold text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Toggle Status
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      disabled={processingId === t.id}
                      className="rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Delete
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
