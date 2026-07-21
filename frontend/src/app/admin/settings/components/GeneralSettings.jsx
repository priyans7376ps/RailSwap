'use client';

export default function GeneralSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">General Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Manage basic platform information and branding.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Name</label>
            <input 
              type="text" 
              value={settings.platform_name || ''}
              onChange={(e) => handleChange('platform_name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Tagline</label>
            <input 
              type="text" 
              value={settings.platform_tagline || ''}
              onChange={(e) => handleChange('platform_tagline', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Email</label>
            <input 
              type="email" 
              value={settings.support_email || ''}
              onChange={(e) => handleChange('support_email', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Support Phone</label>
            <input 
              type="text" 
              value={settings.support_phone || ''}
              onChange={(e) => handleChange('support_phone', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="col-span-1 space-y-2 sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Address</label>
            <textarea 
              rows={3}
              value={settings.company_address || ''}
              onChange={(e) => handleChange('company_address', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Logo URL</label>
            <input 
              type="text" 
              value={settings.platform_logo || ''}
              onChange={(e) => handleChange('platform_logo', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Favicon URL</label>
            <input 
              type="text" 
              value={settings.platform_favicon || ''}
              onChange={(e) => handleChange('platform_favicon', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
