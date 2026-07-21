'use client';

export default function NotificationSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Notification Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configure which system events trigger notifications.</p>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_email_notifications"
              checked={settings.enable_email_notifications || false}
              onChange={(e) => handleChange('enable_email_notifications', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_email_notifications" className="text-sm font-semibold text-slate-300">Enable Email Notifications globally</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_browser_notifications"
              checked={settings.enable_browser_notifications || false}
              onChange={(e) => handleChange('enable_browser_notifications', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_browser_notifications" className="text-sm font-semibold text-slate-300">Enable Browser Notifications globally</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_admin_alerts"
              checked={settings.enable_admin_alerts || false}
              onChange={(e) => handleChange('enable_admin_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_admin_alerts" className="text-sm font-semibold text-slate-300">Enable Admin Alerts (Fraud, Server Errors)</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_match_notifications"
              checked={settings.enable_match_notifications || false}
              onChange={(e) => handleChange('enable_match_notifications', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_match_notifications" className="text-sm font-semibold text-slate-300">Notify users on Ticket Match</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_payment_notifications"
              checked={settings.enable_payment_notifications || false}
              onChange={(e) => handleChange('enable_payment_notifications', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_payment_notifications" className="text-sm font-semibold text-slate-300">Notify users on Payment Success</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="enable_refund_notifications"
              checked={settings.enable_refund_notifications || false}
              onChange={(e) => handleChange('enable_refund_notifications', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="enable_refund_notifications" className="text-sm font-semibold text-slate-300">Notify users on Refund Processed</label>
          </div>
        </div>
      </div>
    </div>
  );
}
