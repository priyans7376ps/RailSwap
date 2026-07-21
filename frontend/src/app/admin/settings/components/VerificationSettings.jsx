'use client';

export default function VerificationSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Ticket Verification Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configure how uploaded tickets are verified by the system.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Verification Time Limit (Hours)</label>
            <input 
              type="number"
              value={settings.verification_time_limit_hours || ''}
              onChange={(e) => handleChange('verification_time_limit_hours', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="require_pnr_verification"
              checked={settings.require_pnr_verification || false}
              onChange={(e) => handleChange('require_pnr_verification', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="require_pnr_verification" className="text-sm font-semibold text-slate-300">Require PNR Verification (IRCTC API)</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="require_pdf_upload"
              checked={settings.require_pdf_upload || false}
              onChange={(e) => handleChange('require_pdf_upload', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="require_pdf_upload" className="text-sm font-semibold text-slate-300">Require PDF E-Ticket Upload</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="auto_reject_expired"
              checked={settings.auto_reject_expired || false}
              onChange={(e) => handleChange('auto_reject_expired', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="auto_reject_expired" className="text-sm font-semibold text-slate-300">Auto Reject Expired Tickets</label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="auto_expire_listings"
              checked={settings.auto_expire_listings || false}
              onChange={(e) => handleChange('auto_expire_listings', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="auto_expire_listings" className="text-sm font-semibold text-slate-300">Auto Expire Listings Past Journey Date</label>
          </div>
        </div>
      </div>
    </div>
  );
}
