'use client';

import { useEffect, useState } from 'react';
import { Bell, CircleDollarSign, ListChecks, TicketCheck, Bookmark, History, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import TicketCard from '../../components/TicketCard';
import EmptyState from '../../components/EmptyState';
import RequireAuth from '../../components/RequireAuth';
import { useAuth } from '../../hooks/useAuth';
import { getMyTickets, getDashboardSummary, getMyRequests, getSavedTickets } from '../../services/api';

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
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, requests, saved, history
  
  const [tickets, setTickets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sumRes = await getDashboardSummary();
        setSummary(sumRes?.data || {});
        
        const tickRes = await getMyTickets();
        const list = tickRes?.data?.tickets || tickRes?.tickets || [];
        setTickets(Array.isArray(list) ? list : []);
        
        const reqRes = await getMyRequests();
        setRequests(Array.isArray(reqRes) ? reqRes : reqRes?.data || []);
        
        const saveRes = await getSavedTickets();
        setSaved(Array.isArray(saveRes) ? saveRes : saveRes?.data || []);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: 'Active tickets', value: String(summary?.active_tickets || 0).padStart(2, '0'), trend: 'Your listings' },
    { label: 'Active requests', value: String(summary?.active_requests || 0).padStart(2, '0'), trend: 'Looking for' },
    { label: 'Completed exchanges', value: String(summary?.completed_exchanges || 0).padStart(2, '0'), trend: 'All time' },
    { label: 'Trust score', value: summary?.trust_score ? `${summary.trust_score}%` : '100%', trend: user?.is_verified ? 'Verified account' : 'Pending verification' },
  ];

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="eyebrow">User dashboard</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-3 text-slate-600">
            {user?.is_verified ? 'Verified traveller' : 'Standard account'} · Trust Score: {summary?.trust_score || 100}%
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <DashboardCard key={stat.label} {...stat} icon={icons[index]} />
          ))}
        </section>

        <section className="mt-8">
          <div className="flex space-x-4 border-b border-slate-200 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'tickets', label: 'My Tickets' },
              { id: 'requests', label: 'My Requests' },
              { id: 'saved', label: 'Saved Tickets' },
              { id: 'history', label: 'Transaction History' }
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
              Loading your data...
            </div>
          ) : (
            <div>
              {activeTab === 'tickets' && (
                tickets.length === 0 ? (
                  <EmptyState title="No tickets uploaded" message="Upload your first ticket to start finding matches." />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {tickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} compact />
                    ))}
                  </div>
                )
              )}
              
              {activeTab === 'requests' && (
                requests.length === 0 ? (
                  <EmptyState title="No active requests" message="Create a request to get notified when a matching ticket is uploaded." />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {requests.map((req) => (
                      <div key={req.id} className="p-4 border rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800">{req.source_station} ➔ {req.destination_station}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{req.status}</span>
                        </div>
                        <p className="text-sm text-slate-600">Date: {req.journey_date}</p>
                        {req.class_type && <p className="text-sm text-slate-600">Class: {req.class_type}</p>}
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
              
              {activeTab === 'history' && (
                <EmptyState title="No transactions yet" message="Your completed exchanges will appear here." />
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
