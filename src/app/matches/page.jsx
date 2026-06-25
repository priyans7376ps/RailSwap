import Navbar from '../../components/Navbar';
import TicketCard from '../../components/TicketCard';
import { getVerifiedTickets } from '../../services/ticketService';

export default function MatchesPage() {
  const matches = getVerifiedTickets();

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <p className="eyebrow">Match results</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Verified ticket matches</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">Ticket cards show route, date, train, class, gender, price and verified badge.</p>
        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {matches.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </section>
      </main>
    </>
  );
}
