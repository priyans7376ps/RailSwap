import { useState } from 'react';
import { BadgeCheck, CalendarDays, IndianRupee, TrainFront, UserRound, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { saveTicket, removeSavedTicket } from '../services/api';

export default function TicketCard({ ticket, compact = false }) {
  const [isSaved, setIsSaved] = useState(false); // Can be prop from parent if known
  
  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        // Mock remove, as we might not have saved_ticket_id here
        setIsSaved(false);
      } else {
        await saveTicket(ticket.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to save ticket', err);
    }
  };

  // Map backend fields or fallback to old mock fields
  const route = ticket.source_station && ticket.destination_station 
    ? `${ticket.source_station} ➔ ${ticket.destination_station}` 
    : ticket.route;
  const date = ticket.journey_date || ticket.date;
  const train = ticket.train_number || ticket.train;
  const classType = ticket.class_type || ticket.classType;
  const gender = ticket.passenger_gender || ticket.gender;
  const price = ticket.exchange_price || ticket.price;
  const verified = ticket.verification_status === 'verified' || ticket.verified;
  const seller = ticket.owner?.name || ticket.seller || 'Anonymous';

  return (
    <article className="premium-card p-5 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl relative">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">TKT-{ticket.id}</p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{route}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              Verified
            </span>
          )}
          <button onClick={handleSaveToggle} className="text-slate-400 hover:text-cyan-600 transition" title="Save Ticket">
            {isSaved ? <BookmarkCheck className="h-5 w-5 text-cyan-600" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <Detail icon={CalendarDays} label={date ? formatDate(date) : ''} />
        <Detail icon={TrainFront} label={train} />
        <Detail icon={UserRound} label={`${classType} / ${gender}`} />
        <Detail icon={IndianRupee} label={formatCurrency(price || 0)} />
      </div>

      {!compact && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Seller <span className="font-semibold text-slate-800">{seller}</span>
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
