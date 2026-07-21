'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminGetAnalytics } from '../../../services/api';

export default function AdminAnalyticsPage() {
  return (
    <RequireAdminAuth>
      <AdminAnalytics />
    </RequireAdminAuth>
  );
}

function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminGetAnalytics();
        setAnalytics(res?.data || {});
      } catch (e) {
        setError(e?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-white">Analytics</h1>
        <p className="text-sm text-slate-400">Professional charts and data visualizations.</p>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading analytics data...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && analytics && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end gap-2 overflow-x-auto pb-2">
              {analytics.revenue_trend?.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-[40px]">
                  <div className="w-full bg-cyan-500 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(5, (val / (Math.max(...analytics.revenue_trend) || 1)) * 100)}%` }}></div>
                  <span className="text-[10px] text-slate-400">{analytics.labels ? new Date(analytics.labels[i]).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : `Day ${i+1}`}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Ticket Uploads</h3>
            <div className="h-64 flex items-end gap-2 overflow-x-auto pb-2">
              {analytics.ticket_uploads?.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-[40px]">
                  <div className="w-full bg-indigo-500 rounded-t-md transition-all duration-500" style={{ height: `${Math.max(5, (val / (Math.max(...analytics.ticket_uploads) || 1)) * 100)}%` }}></div>
                  <span className="text-[10px] text-slate-400">{analytics.labels ? new Date(analytics.labels[i]).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : `Day ${i+1}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
