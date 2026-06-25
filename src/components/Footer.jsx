import Link from 'next/link';
import { MessageCircle, ShieldCheck, TrainFront } from 'lucide-react';

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
              A Phase 1 frontend experience for helping passengers reduce ticket loss through verified, criteria-matched exchanges.
            </p>
          </div>

          <FooterColumn title="Product" links={['Search tickets', 'Upload ticket', 'Verify PNR', 'Matches']} />
          <FooterColumn title="Trust" links={['Safety checks', 'Escrow preview', 'Ratings', 'Support']} />
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="mt-4 flex gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-slate-200">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          Copyright {new Date().getFullYear()} RailSwap. Phase 1 frontend prototype.
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
          <li key={link}>
            <Link href="/" className="transition hover:text-white">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
