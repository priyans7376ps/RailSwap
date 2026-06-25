import { Bell, CircleDollarSign, ListChecks, TicketCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import TicketCard from '../../components/TicketCard';
import EmptyState from '../../components/EmptyState';
import { dashboardData } from '../../utils/dummyData';

const icons = [TicketCheck, ListChecks, CircleDollarSign, Bell];

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <section className="glass-panel rounded-[2rem] p-8">
          <p className="eyebrow">User dashboard</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">Welcome back, {dashboardData.user.name}</h1>
          <p className="mt-3 text-slate-600">{dashboardData.user.verification} · {dashboardData.user.rating} rating</p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, index) => <DashboardCard key={stat.label} {...stat} icon={icons[index]} />)}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Active ticket listings</h2>
            <div className="mt-4 grid gap-4">
              {dashboardData.uploadedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} compact />)}
            </div>
          </div>
          <div className="space-y-6">
            <Panel title="My requests" items={dashboardData.requests} />
            <Panel title="Transactions" items={dashboardData.transactions.map((item) => `${item.id} · ${item.route} · ${item.status}`)} />
            <Panel title="Notifications" items={dashboardData.notifications} />
            <EmptyState title="My uploaded tickets" message="Upload more tickets to increase your match coverage." />
          </div>
        </section>
      </main>
    </>
  );
}

function Panel({ title, items }) {
  return (
    <div className="premium-card p-5">
      <h2 className="font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => <p key={item} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{item}</p>)}
      </div>
    </div>
  );
}
