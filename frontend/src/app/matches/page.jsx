'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import TicketCard from '../../components/TicketCard';
import RequireAuth from '../../components/RequireAuth';
import { getMatches } from '../../services/api';
import EmptyState from '../../components/EmptyState';

export default function MatchesPage() {
  return (
    <RequireAuth>
      <MatchesContent />
    </RequireAuth>
  );
}

function MatchesContent() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getMatches();
        const list = res?.data?.tickets || res?.tickets || [];
        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <section className="glass-panel rounded-[2rem] p-8 md:p-12">
          <p className="eyebrow">Smart Matching</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">Your ticket matches</h1>
          <p className="mt-4 leading-7 text-slate-600 max-w-2xl">
            Based on your recent activity and uploaded tickets, we've found these potential matches. 
            All tickets below have been verified against railway databases.
          </p>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center font-semibold text-cyan-800">
              Analyzing tickets and finding matches...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState 
              title="No matches found" 
              message="We couldn't find any exact matches for your criteria right now. Check back later or adjust your search."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
