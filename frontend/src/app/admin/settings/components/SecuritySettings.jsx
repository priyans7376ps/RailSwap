'use client';

export default function SecuritySettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Security Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Manage authentication and platform security parameters.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">JWT Expiration Time (Mins)</label>
            <input 
              type="number"
              value={settings.jwt_expiration_mins || ''}
              onChange={(e) => handleChange('jwt_expiration_mins', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Refresh Token Expiration (Days)</label>
            <input 
              type="number"
              value={settings.refresh_token_expiration_days || ''}
              onChange={(e) => handleChange('refresh_token_expiration_days', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Login Attempts</label>
            <input 
              type="number"
              value={settings.max_login_attempts || ''}
              onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password Min Length</label>
            <input 
              type="number"
              value={settings.password_min_length || ''}
              onChange={(e) => handleChange('password_min_length', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_2fa"
              checked={settings.enable_2fa || false}
              onChange={(e) => handleChange('enable_2fa', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_2fa" className="text-sm font-semibold text-slate-300">Enable Two Factor Authentication (2FA)</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_login_limit"
              checked={settings.enable_login_limit || false}
              onChange={(e) => handleChange('enable_login_limit', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_login_limit" className="text-sm font-semibold text-slate-300">Enable Login Attempt Limit</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="force_strong_password"
              checked={settings.force_strong_password || false}
              onChange={(e) => handleChange('force_strong_password', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="force_strong_password" className="text-sm font-semibold text-slate-300">Force Strong Password (Alphanumeric & Symbols)</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_account_lock"
              checked={settings.enable_account_lock || false}
              onChange={(e) => handleChange('enable_account_lock', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_account_lock" className="text-sm font-semibold text-slate-300">Enable Account Lockout</label>
          </div>
        </div>
      </div>
    </div>
  );
}
