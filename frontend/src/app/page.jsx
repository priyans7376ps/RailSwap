import Link from 'next/link';
import { ArrowRight, ShieldCheck, Ticket, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO SECTION */}
        <section className="page-shell pb-24 pt-16 md:pt-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                </span>
                Smart Matching Now Live
              </div>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                The smart way to <br className="hidden lg:block" />
                <span className="text-cyan-700">exchange tickets.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Don't cancel your confirmed train ticket. RailSwap intelligently connects you with verified passengers looking for your exact route and date.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/upload-ticket" className="btn-primary">
                  List your ticket
                </Link>
                <Link href="/search-ticket" className="btn-secondary">
                  Search tickets
                </Link>
              </div>
            </div>

            {/* Showcase UI */}
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-cyan-400 to-emerald-400 opacity-20 blur-2xl"></div>
              <div className="premium-card animate-floaty relative p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">12952 • Rajdhani Exp</p>
                      <p className="text-xs font-semibold text-slate-500">Confirmed • 3A</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-cyan-700">₹2,180</p>
                    <p className="text-xs font-semibold text-slate-400 line-through">₹2,865</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">From</p>
                    <p className="font-bold text-slate-900">New Delhi (NDLS)</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400">To</p>
                    <p className="font-bold text-slate-900">Mumbai (MMCT)</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-4 w-4" /> PNR Verified
                  </div>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-700">
                    Buy securely
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="border-y border-slate-200 bg-white py-16">
          <div className="page-shell">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['98%', 'Matching success rate'],
                ['₹1.2M+', 'Saved in cancellation fees'],
                ['10k+', 'Verified active users'],
                ['100%', 'Secure escrow payments'],
              ].map(([metric, label]) => (
                <div key={label} className="text-center">
                  <p className="text-4xl font-black text-slate-950">{metric}</p>
                  <p className="mt-2 font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE SECTION */}
        <section className="page-shell py-24">
          <div className="text-center">
            <p className="eyebrow">Why RailSwap</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">Everything you need for safe exchanges</h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              [ShieldCheck, 'Verified PNRs', 'Every ticket is cross-checked with the railway database. No fake tickets or expired PNRs.'],
              [Users, 'Smart Matching', 'Our algorithm finds exact route, date, and gender matches to ensure 100% transfer success.'],
              [Ticket, 'Secure Escrow', 'Payments are held securely until the ticket is transferred. Zero risk of fraud for both parties.'],
            ].map(([Icon, title, desc]) => (
              <div key={title} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
