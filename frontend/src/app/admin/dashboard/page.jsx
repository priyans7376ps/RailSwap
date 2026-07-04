'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminGetDashboardKpis } from '../../../services/api';


export default function AdminDashboardPage() {
  return (
    <RequireAdminAuth>
      <AdminDashboard />
    </RequireAdminAuth>
  );
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminGetDashboardKpis();
        setKpis(res?.data?.kpis || res?.kpis || res);
      } catch (e) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">Premium KPIs and verification analytics.</p>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {kpis && !loading && (
        <div className="mt-6 space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total Users" value={kpis.total_users} />
            <KpiCard title="Total Tickets" value={kpis.total_tickets} />
            <KpiCard title="Active Tickets" value={kpis.active_tickets} />
            <KpiCard title="Verified Tickets" value={kpis.verified_tickets} />
            <KpiCard title="Pending Verification" value={kpis.pending_verification} />
            <KpiCard title="Successful Exchanges" value={kpis.successful_exchanges} />
            <KpiCard title="Total Transactions" value={kpis.total_transactions} />
            <KpiCard title="Fraud Reports" value={kpis.fraud_reports} />
            
            <KpiCard title="Total Revenue" value={kpis.total_revenue} prefix="₹" />
            <KpiCard title="Daily Revenue" value={kpis.daily_revenue} prefix="₹" />
            <KpiCard title="Monthly Revenue" value={kpis.monthly_revenue} prefix="₹" />
            <KpiCard title="Refund Requests" value={kpis.refund_requests} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top Routes */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Routes</h3>
              <div className="space-y-3">
                {kpis.top_routes?.map((route, i) => (
                  <div key={i} className="flex justify-between text-sm text-slate-400">
                    <span>{route.source} ➔ {route.destination}</span>
                    <span className="text-white font-bold">{route.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Cities</h3>
              <div className="space-y-3">
                {kpis.top_cities?.map((city, i) => (
                  <div key={i} className="flex justify-between text-sm text-slate-400">
                    <span>{city.city}</span>
                    <span className="text-white font-bold">{city.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Active Users */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Active Users</h3>
              <div className="space-y-3">
                {kpis.top_users?.map((u, i) => (
                  <div key={i} className="flex justify-between text-sm text-slate-400">
                    <span>{u.name}</span>
                    <span className="text-white font-bold">{u.exchanges} exch</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, prefix = '' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-semibold text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">
        {prefix}
        {value ?? 0}
      </p>
    </div>
  );
}

