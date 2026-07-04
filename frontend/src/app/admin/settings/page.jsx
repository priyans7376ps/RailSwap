'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { apiRequest } from '../../../services/api';

export default function AdminSettingsPage() {
  return (
    <RequireAdminAuth>
      <SettingsDashboard />
    </RequireAdminAuth>
  );
}

function SettingsDashboard() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [commission, setCommission] = useState('');
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest({ method: "GET", url: "/api/settings/admin" });
        const data = res?.data || res || {};
        setSettings(data);
        setCommission(data.platform_commission_percent || '5.0');
        setMaintenance(data.maintenance_mode || false);
      } catch (e) {
        setError(e?.message || 'Failed to load settings. Endpoint might not be implemented yet.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiRequest({
        method: "PUT",
        url: "/api/settings/admin",
        data: {
          platform_commission_percent: parseFloat(commission),
          maintenance_mode: maintenance
        }
      });
      setSuccess("Settings updated successfully");
    } catch (e) {
      setError(e?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
        <p className="text-sm text-slate-400">Manage global platform configurations.</p>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading...
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-6 text-emerald-200">
          {success}
        </div>
      )}

      {!loading && !error && (
        <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Platform Commission (%)</label>
            <input 
              type="number" 
              step="0.1" 
              required
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-500">Percentage fee charged on successful exchanges.</p>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="maintenance" 
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="maintenance" className="text-sm font-semibold text-slate-300">
              Enable Maintenance Mode
            </label>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={saving}
              className="rounded-lg bg-cyan-600 px-6 py-2 font-semibold text-white hover:bg-cyan-500 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
