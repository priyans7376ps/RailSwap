'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CircleDollarSign, ListChecks, TicketCheck, Bookmark, History, FileText, ArrowDownLeft, ArrowUpRight, PlusCircle, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import TicketCard from '../../components/TicketCard';
import EmptyState from '../../components/EmptyState';
import RequireAuth from '../../components/RequireAuth';
import { useAuth } from '../../hooks/useAuth';
import { getMyListings, getIncomingRequests, getOutgoingRequests, getNotifications, getSavedTickets } from '../../services/api';

const icons = [TicketCheck, FileText, Bookmark, History];

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // listings, incoming, outgoing, saved, notifications
  
  const [listings, setListings] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [saved, setSaved] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const listRes = await getMyListings();
        setListings(listRes?.data?.tickets || listRes?.tickets || []);

        const incRes = await getIncomingRequests();
        setIncoming(incRes?.data?.requests || incRes?.requests || []);

        const outRes = await getOutgoingRequests();
        setOutgoing(outRes?.data?.requests || outRes?.requests || []);

        const saveRes = await getSavedTickets();
        setSaved(Array.isArray(saveRes) ? saveRes : saveRes?.data || []);

        const notifRes = await getNotifications();
        setNotifications(Array.isArray(notifRes) ? notifRes : notifRes?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completedExchangesCount = incoming.filter(r => r.status === 'completed').length + outgoing.filter(r => r.status === 'completed').length;

  const stats = [
    { label: 'Active listings', value: String(listings.filter(l => l.ticket_status === 'published' || l.ticket_status === 'active').length).padStart(2, '0'), trend: 'Live on marketplace' },
    { label: 'Incoming requests', value: String(incoming.filter(r => r.status === 'pending').length).padStart(2, '0'), trend: 'Awaiting your response' },
    { label: 'Outgoing requests', value: String(outgoing.filter(r => r.status === 'pending').length).padStart(2, '0'), trend: 'Sent to sellers' },
    { label: 'Completed exchanges', value: String(completedExchangesCount).padStart(2, '0'), trend: 'Successful swaps' },
  ];

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <section className="glass-panel rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="eyebrow">User dashboard</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-950">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="mt-2 text-slate-600">
              {user?.is_verified ? 'Verified traveller' : 'Standard account'} · Manage tickets, track exchange requests & notifications.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/upload-ticket" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2.5 px-4">
              <PlusCircle className="h-4 w-4" /> Post Ticket
            </Link>
            <Link href="/search-ticket" className="btn-secondary inline-flex items-center gap-1.5 text-xs py-2.5 px-4">
              <Search className="h-4 w-4" /> Search Tickets
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <DashboardCard key={stat.label} {...stat} icon={icons[index]} />
          ))}
        </section>

        <section className="mt-8">
          <div className="flex space-x-4 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'listings', label: 'My Listings' },
              { id: 'incoming', label: 'Incoming Requests' },
              { id: 'outgoing', label: 'Outgoing Requests' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'saved', label: 'Saved Tickets' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-4 whitespace-nowrap font-semibold ${
                  activeTab === tab.id
                    ? 'border-b-2 border-cyan-600 text-cyan-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="mt-4 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-6 text-center text-sm font-semibold text-cyan-800">
              Loading your dashboard activity...
            </div>
          ) : (
            <div>
              {activeTab === 'listings' && (
                listings.length === 0 ? (
                  <EmptyState title="No active listings" message="Post a ticket to start receiving exchange offers." />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {listings.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} compact />
                    ))}
                  </div>
                )
              )}
              
              {activeTab === 'incoming' && (
                incoming.length === 0 ? (
                  <EmptyState title="No incoming exchange requests" message="When buyers request your listings, they will appear here." />
                ) : (
                  <div className="space-y-3">
                    {incoming.map((req) => (
                      <div key={req.id} className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{req.ticket?.source_station} → {req.ticket?.destination_station}</span>
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full capitalize">{req.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Buyer: {req.buyer?.name || req.buyer?.email}</p>
                        </div>
                        <Link href="/requests" className="btn-secondary text-xs py-1.5 px-3">
                          Manage Request
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'outgoing' && (
                outgoing.length === 0 ? (
                  <EmptyState title="No outgoing requests sent" message="Search tickets and click 'Request Exchange' to propose a swap." />
                ) : (
                  <div className="space-y-3">
                    {outgoing.map((req) => (
                      <div key={req.id} className="p-4 border rounded-xl bg-white shadow-sm flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{req.ticket?.source_station} → {req.ticket?.destination_station}</span>
                            <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full capitalize">{req.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Seller: {req.seller?.name || req.seller?.email}</p>
                        </div>
                        <Link href="/requests" className="btn-secondary text-xs py-1.5 px-3">
                          Track Status
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'notifications' && (
                notifications.length === 0 ? (
                  <EmptyState title="No notifications" message="System updates and request alerts will appear here." />
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3.5 border rounded-xl bg-white flex items-start gap-3">
                        <Bell className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              
              {activeTab === 'saved' && (
                saved.length === 0 ? (
                  <EmptyState title="No saved tickets" message="Bookmark tickets you're interested in." />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {saved.map((item) => (
                       item.ticket ? <TicketCard key={item.id} ticket={item.ticket} compact /> : <div key={item.id}>Ticket unavailable</div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
