import Navbar from '../../components/Navbar';
import SearchFilter from '../../components/SearchFilter';
import TicketCard from '../../components/TicketCard';
import { tickets } from '../../utils/dummyData';

export default function SearchTicketPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <p className="eyebrow">Buyer search</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Find a matching train ticket</h1>
        <div className="mt-8"><SearchFilter /></div>
        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        </section>
      </main>
    </>
  );
}
