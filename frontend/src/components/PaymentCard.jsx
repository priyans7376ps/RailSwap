'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

export default function PaymentCard({ amount, onSubmit, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    
    setLoading(true);
    setError('');
    
    try {
      await onSubmit();
    } catch (err) {
      setError(err?.message || 'Payment failed.');
      setLoading(false);
    }
  };

  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-900">Payment details</h3>
        <div className="flex gap-2">
          <div className="grid h-8 w-12 place-items-center rounded bg-slate-100 text-[10px] font-bold text-slate-400">VISA</div>
          <div className="grid h-8 w-12 place-items-center rounded bg-slate-100 text-[10px] font-bold text-slate-400">MC</div>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="label">Card number</span>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input className="field pl-11" placeholder="4242 4242 4242 4242" required />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="label">Expiry date</span>
            <input className="field" placeholder="MM/YY" required />
          </label>
          <label className="space-y-2">
            <span className="label">CVC</span>
            <input className="field" placeholder="123" required />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="label">Name on card</span>
          <input className="field" placeholder="John Doe" required />
        </label>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-primary mt-2 w-full"
          disabled={disabled || loading}
        >
          {loading ? 'Processing...' : `Pay ₹${amount} securely`}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="h-3 w-3" />
          Payments are secured with 256-bit encryption
        </div>
      </form>
    </div>
  );
}
