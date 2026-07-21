'use client';

export default function AppearanceSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Appearance Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Customize the look and feel of the user portal.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Theme Mode</label>
            <select 
              value={settings.theme_mode || 'system'}
              onChange={(e) => handleChange('theme_mode', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="system">System Mode</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Color (Hex)</label>
            <input 
              type="text"
              placeholder="#06b6d4"
              value={settings.primary_color || ''}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Accent Color (Hex)</label>
            <input 
              type="text"
              placeholder="#6366f1"
              value={settings.accent_color || ''}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
