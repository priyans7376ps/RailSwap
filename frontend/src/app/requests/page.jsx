'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Ban, CreditCard, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RequireAuth from '../../components/RequireAuth';
import {
  acceptExchangeRequest,
  cancelExchangeRequest,
  completeExchangePayment,
  getIncomingRequests,
  getOutgoingRequests,
  rejectExchangeRequest,
} from '../../services/api';

export default function RequestsPage() {
  return (
    <RequireAuth>
      <RequestsContent />
    </RequireAuth>
  );
}

function RequestsContent() {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchRequests = async (tab = activeTab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'incoming') {
        const res = await getIncomingRequests();
        setRequests(res?.data?.requests || res?.requests || []);
      } else {
        const res = await getOutgoingRequests();
        setRequests(res?.data?.requests || res?.requests || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleAccept = async (id) => {
    try {
      await acceptExchangeRequest(id);
      setActionMsg('Exchange request accepted! Status updated to Matched.');
      fetchRequests(activeTab);
    } catch (err) {
      setError(err?.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectExchangeRequest(id);
      setActionMsg('Exchange request rejected.');
      fetchRequests(activeTab);
    } catch (err) {
      setError(err?.message || 'Failed to reject request.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelExchangeRequest(id);
      setActionMsg('Exchange request cancelled.');
      fetchRequests(activeTab);
    } catch (err) {
      setError(err?.message || 'Failed to cancel request.');
    }
  };

  const handlePayment = async (id) => {
    try {
      await completeExchangePayment(id);
      setActionMsg('Payment completed! Exchange successfully finalized.');
      fetchRequests(activeTab);
    } catch (err) {
      setError(err?.message || 'Payment completion failed.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Exchange Request Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage incoming seller exchange offers and outgoing buyer proposals.
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="mt-6 flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold text-sm transition ${
              activeTab === 'incoming'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" /> Incoming Requests (As Seller)
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold text-sm transition ${
              activeTab === 'outgoing'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" /> Outgoing Requests (As Buyer)
          </button>
        </div>

        {actionMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
            {actionMsg}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 py-16 text-center text-slate-500 font-medium">Loading exchange requests...</div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              {activeTab === 'incoming' ? 'No incoming exchange requests' : 'No outgoing requests sent'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeTab === 'incoming'
                ? 'When buyers send requests for your tickets, they will appear here.'
                : 'Search available tickets to send exchange requests.'}
            </p>
            {activeTab === 'outgoing' && (
              <Link href="/search-ticket" className="btn-primary mt-4 inline-flex items-center gap-2">
                Search Tickets
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        r.status === 'accepted' || r.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Created: {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>

                  {r.ticket && (
                    <div className="mt-1">
                      <h4 className="font-bold text-slate-950 text-lg">
                        PNR {r.ticket.pnr_number}: {r.ticket.source_station} → {r.ticket.destination_station}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Train {r.ticket.train_number} | Journey Date: <span className="font-semibold text-slate-900">{r.ticket.journey_date}</span> | Class: {r.ticket.class_type} | Price: ₹{r.ticket.exchange_price}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 pt-1">
                    {activeTab === 'incoming' ? (
                      <p>Buyer: <span className="font-semibold text-slate-900">{r.buyer?.name || r.buyer?.email}</span></p>
                    ) : (
                      <p>Seller: <span className="font-semibold text-slate-900">{r.seller?.name || r.seller?.email}</span></p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {activeTab === 'incoming' && r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(r.id)}
                        className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </>
                  )}

                  {activeTab === 'outgoing' && r.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1 text-slate-600"
                    >
                      <Ban className="h-4 w-4" /> Cancel Request
                    </button>
                  )}

                  {r.status === 'accepted' && (
                    <button
                      onClick={() => handlePayment(r.id)}
                      className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      <CreditCard className="h-4 w-4" /> Proceed to Payment
                    </button>
                  )}

                  {r.ticket && (
                    <Link
                      href={`/ticket/${r.ticket.id}`}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      View Ticket
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
