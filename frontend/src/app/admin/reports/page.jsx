'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { apiRequest } from '../../../services/api';

export default function AdminReportsPage() {
  return (
    <RequireAdminAuth>
      <ReportsDashboard />
    </RequireAdminAuth>
  );
}

function ReportsDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Need to create this admin endpoint in backend later if it doesn't exist
        const res = await apiRequest({ method: "GET", url: "/api/reports/admin" });
        setReports(res?.data || res || []);
      } catch (e) {
        setError(e?.message || 'Failed to load reports. Endpoint might not be implemented yet.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resolveReport = async (id) => {
    try {
      await apiRequest({ method: "PUT", url: `/api/reports/admin/${id}/resolve` });
      setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    } catch (e) {
      alert("Failed to resolve report: " + (e?.message || ""));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-white">Reports Management</h1>
        <p className="text-sm text-slate-400">Handle user reports for fraud and inappropriate behavior.</p>
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

      {!loading && !error && reports.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          No reports found.
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="mt-6 space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white uppercase text-sm">REP-{report.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                      report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-300">Reason: {report.reason}</p>
                  <p className="mt-1 text-slate-400 text-sm">{report.description}</p>
                </div>
                {report.status === 'pending' && (
                  <button 
                    onClick={() => resolveReport(report.id)}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 text-sm font-semibold transition"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
