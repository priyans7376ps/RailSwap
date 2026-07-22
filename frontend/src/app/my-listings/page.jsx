'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Edit3, Trash2, RefreshCw, Power, ShieldCheck, Tag, PlusCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RequireAuth from '../../components/RequireAuth';
import { deactivateListing, deleteListing, getMyListings, republishListing } from '../../services/api';

const tabs = [
  { id: '', label: 'All Listings' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending Verification' },
  { id: 'matched', label: 'Matched' },
  { id: 'completed', label: 'Completed' },
  { id: 'expired', label: 'Expired' },
  { id: 'rejected', label: 'Rejected' },
];

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <MyListingsContent />
    </RequireAuth>
  );
}

function MyListingsContent() {
  const [activeTab, setActiveTab] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchListings = async (status = activeTab) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyListings(status);
      setTickets(res?.data?.tickets || res?.tickets || []);
    } catch (err) {
      setError(err?.message || 'Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(activeTab);
  }, [activeTab]);

  const handleDeactivate = async (id) => {
    try {
      await deactivateListing(id);
      setActionMessage('Listing deactivated successfully.');
      fetchListings(activeTab);
    } catch (err) {
      setError(err?.message || 'Deactivation failed.');
    }
  };

  const handleRepublish = async (id) => {
    try {
      await republishListing(id);
      setActionMessage('Listing republished successfully.');
      fetchListings(activeTab);
    } catch (err) {
      setError(err?.message || 'Republish failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteListing(id);
      setActionMessage('Listing deleted successfully.');
      fetchListings(activeTab);
    } catch (err) {
      setError(err?.message || 'Delete failed.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">My Ticket Listings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your ticket inventory, review status transitions, and perform listing actions.
            </p>
          </div>
          <Link href="/upload-ticket" className="btn-primary inline-flex items-center gap-2 self-start">
            <PlusCircle className="h-4 w-4" /> Add New Ticket
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === t.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {actionMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 py-16 text-center text-slate-500 font-medium">Loading your listings...</div>
        ) : tickets.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Tag className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-slate-900">No listings found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeTab ? `No ${activeTab} listings match this filter.` : "You haven't posted any ticket listings yet."}
            </p>
            <Link href="/upload-ticket" className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Post a Ticket
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((t) => (
              <div key={t.id} className="premium-card flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                      PNR: {t.pnr_number}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        t.ticket_status === 'published' || t.ticket_status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.ticket_status === 'matched' || t.ticket_status === 'payment_pending'
                          ? 'bg-amber-100 text-amber-800'
                          : t.ticket_status === 'completed'
                          ? 'bg-cyan-100 text-cyan-800'
                          : t.ticket_status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.ticket_status}
                    </span>
                  </div>

                  <h4 className="mt-3 font-bold text-slate-950 text-base">
                    {t.source_station} → {t.destination_station}
                  </h4>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-400">Train:</span> {t.train_number}</p>
                    <p><span className="font-semibold text-slate-400">Date:</span> {t.journey_date}</p>
                    <p><span className="font-semibold text-slate-400">Class:</span> {t.class_type} | {t.passenger_gender}</p>
                    <p><span className="font-semibold text-slate-400">Price:</span> ₹{t.exchange_price} <span className="line-through text-slate-400">₹{t.original_price}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link href={`/ticket/${t.id}`} className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>

                  <div className="flex items-center gap-1">
                    {t.ticket_status === 'published' || t.ticket_status === 'active' ? (
                      <button
                        onClick={() => handleDeactivate(t.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                        title="Deactivate"
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    ) : t.ticket_status === 'draft' ? (
                      <button
                        onClick={() => handleRepublish(t.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                        title="Republish"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    ) : null}

                    {t.ticket_status !== 'matched' && t.ticket_status !== 'completed' && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
