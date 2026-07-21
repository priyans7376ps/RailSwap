'use client';

export default function EmailSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Email Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configure SMTP settings for system emails.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Host</label>
            <input 
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => handleChange('smtp_host', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Port</label>
            <input 
              type="number"
              value={settings.smtp_port || ''}
              onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Username</label>
            <input 
              type="text"
              value={settings.smtp_username || ''}
              onChange={(e) => handleChange('smtp_username', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Password</label>
            <input 
              type="password"
              placeholder={settings.smtp_password ? '••••••••' : ''}
              onChange={(e) => handleChange('smtp_password', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Email</label>
            <input 
              type="email"
              value={settings.sender_email || ''}
              onChange={(e) => handleChange('sender_email', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Name</label>
            <input 
              type="text"
              value={settings.sender_name || ''}
              onChange={(e) => handleChange('sender_name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6">
          <button 
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition"
          >
            Send Test Email
          </button>
        </div>
      </div>
    </div>
  );
}
