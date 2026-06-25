import Link from 'next/link';
import { ArrowRight, BadgeCheck, CircleDollarSign, FileCheck2, LockKeyhole, Search, ShieldCheck, Sparkles, TicketCheck, TrainFront, UsersRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TicketCard from '../components/TicketCard';
import { tickets } from '../utils/dummyData';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="page-shell grid min-h-[calc(100vh-80px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Smart Train Ticket Exchange Marketplace</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight text-slate-950 md:text-7xl">
              RailSwap turns unused train tickets into trusted matches.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Help passengers reduce ticket loss by connecting them with verified buyers who need the same route, date, class and criteria.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/search-ticket" className="btn-primary">
                Search tickets <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/upload-ticket" className="btn-secondary">
                Upload ticket
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="glass-panel animate-floaty rounded-[2rem] p-5">
              <TicketCard ticket={tickets[0]} />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {['PNR checked', 'Escrow ready', 'Chat enabled'].map((item) => (
                  <div key={item} className="rounded-2xl bg-white p-3 text-center text-xs font-bold text-slate-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Section eyebrow="Problem" title="Cancelled plans should not mean complete ticket loss.">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Last-minute changes', 'Passengers often cannot travel, but lack a structured way to recover value.'],
              ['Manual trust gaps', 'Informal exchanges create uncertainty around PNR, identity and payment.'],
              ['Poor discovery', 'Buyers cannot easily find tickets matching exact route, date, class and criteria.'],
            ].map(([title, text]) => <InfoCard key={title} title={title} text={text} />)}
          </div>
        </Section>

        <Section eyebrow="Solution" title="A marketplace layer for verified, criteria-matched train ticket exchange.">
          <div className="grid gap-5 lg:grid-cols-4">
            {[
              [FileCheck2, 'Upload', 'Sellers add ticket details and PDF proof.'],
              [ShieldCheck, 'Verify', 'RailSwap checks PNR and listing consistency.'],
              [Search, 'Match', 'Buyers filter by route, date, class and gender.'],
              [CircleDollarSign, 'Exchange', 'Payment and chat flows support safe handover.'],
            ].map(([Icon, title, text]) => <Feature key={title} icon={Icon} title={title} text={text} />)}
          </div>
        </Section>

        <Section id="how" eyebrow="How it works" title="Designed for clarity from listing to confirmation.">
          <div className="grid gap-5 md:grid-cols-3">
            {['List a ticket with travel criteria', 'Get verified matches from real demand', 'Coordinate exchange through secure chat'].map((step, index) => (
              <div key={step} className="premium-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-cyan-700 text-sm font-bold text-white">{index + 1}</span>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{step}</h3>
              </div>
            ))}
          </div>
        </Section>

        <Section id="features" eyebrow="Features" title="Premium tools for a high-trust travel exchange experience.">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              [TrainFront, 'Route intelligence', 'Match the exact journey attributes that matter.'],
              [BadgeCheck, 'Verified badge', 'Signal confidence on eligible ticket cards.'],
              [UsersRound, 'Buyer-seller chat', 'Keep exchange coordination in one place.'],
              [LockKeyhole, 'Payment preview', 'A secure payment interface ready for backend integration.'],
              [Sparkles, 'Dashboard UX', 'Track listings, requests, transactions and alerts.'],
              [TicketCheck, 'Upload workflow', 'Collect full ticket metadata and PDF proof.'],
            ].map(([Icon, title, text]) => <Feature key={title} icon={Icon} title={title} text={text} />)}
          </div>
        </Section>

        <Section id="trust" eyebrow="Trust & safety" title="Built around verification, visibility and controlled exchange.">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white">
            <div className="grid gap-6 md:grid-cols-3">
              {['PNR consistency checks', 'Verified profiles and ratings', 'Escrow-ready transaction UI'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                  <p className="mt-4 font-bold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <section className="page-shell py-16">
          <div className="premium-card flex flex-col items-start justify-between gap-6 bg-cyan-700 p-8 text-white md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-cyan-100">Phase 1 frontend prototype</p>
              <h2 className="mt-2 text-3xl font-bold">Start exploring RailSwap today.</h2>
            </div>
            <Link href="/signup" className="btn-secondary">
              Create account
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="page-shell py-16">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="premium-card p-6">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{text}</p>
    </div>
  );
}
