'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Tickets', href: '/admin/tickets' },
  { label: 'Verification', href: '/admin/verification' },
  { label: 'Transactions', href: '/admin/transactions' },
  { label: 'Payments', href: '/admin/payments' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Logs', href: '/admin/logs' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.6)] md:flex">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/20 ring-1 ring-cyan-400/40" />
          <div>
            <p className="text-sm font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">RailSwap</p>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? 'group flex items-center rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 px-3 py-2 text-sm font-semibold text-cyan-50 ring-1 ring-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all'
                  : 'group flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          className="w-full rounded-xl border border-white/5 bg-white/5 px-3 py-2.5 text-center text-xs tracking-wider uppercase font-bold text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('access_token_payload');
            routerReplace('/admin/login');
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function routerReplace(path) {
  if (typeof window === 'undefined') return;
  window.location.href = path;
}
