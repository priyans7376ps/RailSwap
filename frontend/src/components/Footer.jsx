'use client';

import Link from 'next/link';
import { MessageCircle, ShieldCheck, TrainFront } from 'lucide-react';

const CURRENT_YEAR = 2026;

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="page-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-300/20">
                <TrainFront className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold">RailSwap</p>
                <p className="text-sm text-slate-400">Smart Train Ticket Exchange Marketplace</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              Helping passengers reduce ticket loss through verified, criteria-matched exchanges with trusted users.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: 'Search tickets', href: '/search-ticket' },
              { label: 'Upload ticket', href: '/upload-ticket' },
              { label: 'Verify PNR', href: '/verify-ticket' },
              { label: 'Matches', href: '/matches' },
            ]}
          />
          <FooterColumn
            title="Trust"
            links={[
              { label: 'Safety checks', href: '/verify-ticket' },
              { label: 'Escrow payments', href: '/payment' },
              { label: 'Ratings', href: '/profile' },
              { label: 'Dashboard', href: '/dashboard' },
            ]}
          />
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="mt-4 flex gap-3">
              <Link href="/chat" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-slate-200 transition hover:bg-white/20">
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link href="/verify-ticket" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-emerald-200 transition hover:bg-white/20">
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          &copy; {CURRENT_YEAR} RailSwap. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-400">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
