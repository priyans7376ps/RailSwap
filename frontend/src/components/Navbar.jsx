'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck, TrainFront, X, Bell } from 'lucide-react';
import { cn } from '../utils/cn';
import AuthLinks from './AuthLinks';
import { useAuth } from '../hooks/useAuth';
import { getNotifications } from '../services/api';

const links = [
  { href: '/', label: 'Home' },
  { href: '/search-ticket', label: 'Search' },
  { href: '/upload-ticket', label: 'Upload' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/verify-ticket', label: 'Verify' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      getNotifications().then(res => {
        const notifs = Array.isArray(res) ? res : res?.data || [];
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      }).catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [pathname, user]);

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
          {!authLoading && user && (
            <Link href="/dashboard" className="relative p-2 text-slate-600 hover:text-cyan-700 transition">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </Link>
          )}
          <AuthLinks />
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 lg:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition',
                  pathname === link.href && 'bg-cyan-50 text-cyan-800',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2 items-center justify-between">
            <AuthLinks />
            {!authLoading && user && (
              <Link href="/dashboard" className="relative p-2 text-slate-600">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
