'use client';

export default function PaymentSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Payment Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Manage payment gateways, holding periods, and limits.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Gateway</label>
            <select 
              value={settings.payment_gateway || 'stripe'}
              onChange={(e) => handleChange('payment_gateway', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="razorpay">Razorpay</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Commission Percentage</label>
            <input 
              type="number" step="0.1"
              value={settings.payment_commission_percent || ''}
              onChange={(e) => handleChange('payment_commission_percent', parseFloat(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Refund Window (Days)</label>
            <input 
              type="number"
              value={settings.refund_window_days || ''}
              onChange={(e) => handleChange('refund_window_days', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Hold Time (Hours)</label>
            <input 
              type="number"
              value={settings.payment_hold_time_hours || ''}
              onChange={(e) => handleChange('payment_hold_time_hours', parseInt(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Minimum Withdrawal Amount</label>
            <input 
              type="number"
              value={settings.min_withdrawal_amount || ''}
              onChange={(e) => handleChange('min_withdrawal_amount', parseFloat(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Maximum Transaction Amount</label>
            <input 
              type="number"
              value={settings.max_transaction_amount || ''}
              onChange={(e) => handleChange('max_transaction_amount', parseFloat(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="auto_refund"
              checked={settings.auto_refund || false}
              onChange={(e) => handleChange('auto_refund', e.target.checked)}
              className="h-5 w-5 rounded border-white/10 bg-black/40 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label htmlFor="auto_refund" className="text-sm font-semibold text-slate-300">Enable Auto Refund on Ticket Rejection</label>
          </div>
        </div>
      </div>
    </div>
  );
}
