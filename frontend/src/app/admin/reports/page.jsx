'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListReports, adminResolveReport, adminDeleteReport, adminUpdateUserStatus, adminDeleteTicket } from '../../../services/api';

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
  const [processingId, setProcessingId] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminListReports();
      const list = res?.data || res?.reports || res || [];
      setReports(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (id, actionType, relatedId = null) => {
    try {
      setProcessingId(id);
      if (actionType === 'resolve') {
        await adminResolveReport(id);
      } else if (actionType === 'delete_report') {
        await adminDeleteReport(id);
      } else if (actionType === 'suspend_user') {
        await adminUpdateUserStatus(relatedId, 'suspended');
      } else if (actionType === 'delete_listing') {
        await adminDeleteTicket(relatedId);
      }
      await fetchReports();
    } catch (e) {
      alert("Failed to execute action: " + (e?.message || ""));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-white">Reports Management</h1>
        <p className="text-sm text-slate-400">Handle user reports for fraud and inappropriate behavior.</p>
      </div>

      {loading && reports.length === 0 && (
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

      {(!loading || reports.length > 0) && !error && reports.length > 0 && (
        <div className="mt-6 space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white uppercase text-sm">REP-{report.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                      report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 
                      report.status === 'dismissed' ? 'bg-slate-500/20 text-slate-300' : 
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-300 flex flex-col gap-1">
                    <span><strong>Reporter ID:</strong> {report.reporter_id}</span>
                    {report.reported_user_id && <span><strong>Reported User ID:</strong> {report.reported_user_id}</span>}
                    {report.ticket_id && <span><strong>Ticket ID:</strong> {report.ticket_id}</span>}
                    <span className="mt-1"><strong>Reason:</strong> {report.reason}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {report.status === 'pending' && (
                    <button 
                      onClick={() => handleAction(report.id, 'resolve')}
                      disabled={processingId === report.id}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 text-xs font-semibold transition disabled:opacity-50"
                    >
                      Resolve Report
                    </button>
                  )}
                  {report.reported_user_id && (
                    <button 
                      onClick={() => handleAction(report.id, 'suspend_user', report.reported_user_id)}
                      disabled={processingId === report.id}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 text-xs font-semibold transition disabled:opacity-50"
                    >
                      Suspend User
                    </button>
                  )}
                  {report.ticket_id && (
                    <button 
                      onClick={() => handleAction(report.id, 'delete_listing', report.ticket_id)}
                      disabled={processingId === report.id}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-300 rounded-lg hover:bg-rose-500/30 text-xs font-semibold transition disabled:opacity-50"
                    >
                      Delete Ticket Listing
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction(report.id, 'delete_report')}
                    disabled={processingId === report.id}
                    className="px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 text-xs font-semibold transition disabled:opacity-50"
                  >
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
