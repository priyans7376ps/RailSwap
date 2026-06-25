import { BadgeCheck, CalendarDays, IndianRupee, TrainFront, UserRound } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TicketCard({ ticket, compact = false }) {
  return (
    <article className="premium-card p-5 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">{ticket.id}</p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{ticket.route}</h3>
        </div>
        {ticket.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <Detail icon={CalendarDays} label={formatDate(ticket.date)} />
        <Detail icon={TrainFront} label={ticket.train} />
        <Detail icon={UserRound} label={`${ticket.classType} / ${ticket.gender}`} />
        <Detail icon={IndianRupee} label={formatCurrency(ticket.price)} />
      </div>

      {!compact && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Seller <span className="font-semibold text-slate-800">{ticket.seller}</span>
          </p>
          <button className="btn-primary px-4 py-2">View match</button>
        </div>
      )}
    </article>
  );
}

function Detail({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-cyan-700" />
      <span>{label}</span>
    </div>
  );
}
