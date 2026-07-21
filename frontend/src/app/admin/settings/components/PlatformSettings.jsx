'use client';

export default function PlatformSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Platform Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configure global platform behavior and limits.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Status</label>
            <select 
              value={settings.maintenance_mode ? 'maintenance' : 'active'}
              onChange={(e) => handleChange('maintenance_mode', e.target.value === 'maintenance')}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="active">Active (Live)</option>
              <option value="maintenance">Maintenance Mode</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Commission (%)</label>
            <input 
              type="number" step="0.1"
              value={settings.platform_commission_percent || ''}
              onChange={(e) => handleChange('platform_commission_percent', parseFloat(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Active Listings / User</label>
            <input 
              type="number"
              value={settings.max_active_listings || ''}
              onChange={(e) => handleChange('max_active_listings', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Upload Size (MB)</label>
            <input 
              type="number"
              value={settings.max_upload_size_mb || ''}
              onChange={(e) => handleChange('max_upload_size_mb', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Default Currency</label>
            <select 
              value={settings.default_currency || 'USD'}
              onChange={(e) => handleChange('default_currency', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Timezone</label>
            <input 
              type="text"
              placeholder="e.g. UTC"
              value={settings.timezone || ''}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
