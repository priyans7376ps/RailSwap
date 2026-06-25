'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck, TrainFront } from 'lucide-react';
import { cn } from '../utils/cn';

const links = [
  { href: '/', label: 'Home' },
  { href: '/search-ticket', label: 'Search' },
  { href: '/upload-ticket', label: 'Upload' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/verify-ticket', label: 'Verify' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <nav className="page-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-white shadow-lg shadow-cyan-700/20">
            <TrainFront className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold text-slate-950">RailSwap</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">Smart Train Ticket Exchange Marketplace</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition',
                pathname === link.href && 'bg-cyan-50 text-cyan-800',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/login" className="btn-secondary py-2.5">
            Login
          </Link>
          <Link href="/signup" className="btn-primary py-2.5">
            <ShieldCheck className="h-4 w-4" />
            Join RailSwap
          </Link>
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </nav>
    </header>
  );
}
