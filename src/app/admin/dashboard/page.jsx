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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard title="Total Users" value={kpis.total_users} />
          <KpiCard title="Total Tickets" value={kpis.total_tickets} />
          <KpiCard title="Active Tickets" value={kpis.active_tickets} />
          <KpiCard title="Verified Tickets" value={kpis.verified_tickets} />
          <KpiCard title="Pending Verification" value={kpis.pending_verification} />
          <KpiCard title="Successful Exchanges" value={kpis.successful_exchanges} />
          <KpiCard title="Total Transactions" value={kpis.total_transactions} />
          <KpiCard title="Revenue" value={kpis.revenue} prefix="$" />
          <KpiCard title="Refund Requests" value={kpis.refund_requests} />
          <KpiCard title="Fraud Reports" value={kpis.fraud_reports} />
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

