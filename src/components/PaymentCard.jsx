import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { tickets } from '../utils/dummyData';
import { formatCurrency } from '../utils/formatters';

export default function PaymentCard() {
  const ticket = tickets[0];

  return (
    <div className="premium-card grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <p className="eyebrow">Secure checkout</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Reserve verified ticket</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="font-bold text-slate-950">{ticket.route}</p>
          <p className="mt-2 text-sm text-slate-600">{ticket.train} · {ticket.classType} · {ticket.gender}</p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Amount</span>
            <span className="text-2xl font-bold text-slate-950">{formatCurrency(ticket.price)}</span>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Funds held in escrow until ticket handover is confirmed.
        </div>
      </div>

      <form className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block space-y-2">
          <span className="label">Card number</span>
          <div className="relative">
            <CreditCard className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input className="field pl-11" placeholder="4242 4242 4242 4242" />
          </div>
        </label>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <input className="field" placeholder="MM/YY" />
          <input className="field" placeholder="CVV" />
        </div>
        <button className="btn-primary mt-5 w-full">
          <LockKeyhole className="h-4 w-4" />
          Pay securely
        </button>
      </form>
    </div>
  );
}
