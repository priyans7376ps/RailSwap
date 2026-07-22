'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ShieldCheck, Calendar, MapPin, Train, Star, CheckCircle, ArrowRight, UserCheck, Clock } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { createExchangeRequest, getListingDetails, hasAuthToken } from '../../../services/api';

export default function TicketDetailPage({ params }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getListingDetails(ticketId);
        setTicket(res?.data?.ticket || res?.ticket || null);
      } catch (err) {
        setError(err?.message || 'Failed to load ticket details.');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchDetails();
    }
  }, [ticketId]);

  const handleRequestExchange = async (e) => {
    e.preventDefault();
    if (!hasAuthToken()) {
      window.location.href = `/login?redirect=/ticket/${ticketId}`;
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await createExchangeRequest(ticketId, requestNotes);
      setSuccessMsg('Exchange request sent successfully! Track request under /requests page.');
    } catch (err) {
      setError(err?.message || 'Failed to submit exchange request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="mb-6">
          <Link href="/search-ticket" className="text-sm font-semibold text-cyan-700 hover:underline">
            ← Back to Ticket Search
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center font-medium text-slate-500">Loading ticket details...</div>
        ) : error && !ticket ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
            <h3 className="text-lg font-bold">Error Loading Listing</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : ticket ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Main Details */}
            <div className="space-y-6">
              <div className="premium-card p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="eyebrow">Verified Railway Ticket</span>
                    <h1 className="mt-1 text-3xl font-bold text-slate-950">
                      {ticket.source_station} to {ticket.destination_station}
                    </h1>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-cyan-700">₹{ticket.exchange_price}</span>
                    {ticket.original_price > ticket.exchange_price && (
                      <p className="text-xs text-slate-400 line-through">₹{ticket.original_price}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Train className="h-3.5 w-3.5 text-cyan-600" /> Train Number
                    </p>
                    <p className="mt-1 font-bold text-slate-900">{ticket.train_number}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-cyan-600" /> Journey Date
                    </p>
                    <p className="mt-1 font-bold text-slate-900">{ticket.journey_date}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-400">Class</p>
                    <p className="mt-1 font-bold text-slate-900">{ticket.class_type}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-400">Gender</p>
                    <p className="mt-1 font-bold text-slate-900 capitalize">{ticket.passenger_gender}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>PNR Status: Verified</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-cyan-800 border border-cyan-200 capitalize">
                    <span>Listing Status: {ticket.ticket_status}</span>
                  </div>
                </div>
              </div>

              {/* Status Audit Log */}
              {ticket.status_history && ticket.status_history.length > 0 && (
                <div className="premium-card p-6">
                  <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-400" /> Status Transition History
                  </h3>
                  <div className="mt-4 space-y-3">
                    {ticket.status_history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-semibold text-slate-900 capitalize">{h.new_status}</span>
                          {h.notes && <span className="text-slate-500 ml-2">({h.notes})</span>}
                        </div>
                        <span className="text-slate-400">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Exchange Action */}
            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-xl font-bold text-slate-950">Seller Overview</h3>
                <div className="mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan-100 font-bold text-cyan-800">
                    {ticket.owner?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{ticket.owner?.name || 'Verified Seller'}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{ticket.seller_rating || 5.0} / 5.0 rating ({ticket.seller_rating_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {successMsg ? (
                  <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-sm font-semibold text-emerald-800">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-600" />
                    <p className="mt-2">{successMsg}</p>
                    <Link href="/requests" className="btn-primary mt-4 inline-block text-xs py-2 px-4">
                      View My Requests
                    </Link>
                  </div>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleRequestExchange}>
                    <label className="block space-y-2">
                      <span className="text-xs font-semibold text-slate-600">Note for Seller (Optional)</span>
                      <textarea
                        className="field text-sm min-h-20"
                        placeholder="Add a message for the seller regarding travel timing or seat preference..."
                        value={requestNotes}
                        onChange={(e) => setRequestNotes(e.target.value)}
                      />
                    </label>

                    {error && (
                      <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || (ticket.ticket_status !== 'published' && ticket.ticket_status !== 'active')}
                      className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Submitting Request...' : <><ArrowRight className="h-4 w-4" /> Request Exchange</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
