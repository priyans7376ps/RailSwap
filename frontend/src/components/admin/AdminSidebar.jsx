'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md md:flex">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/20 ring-1 ring-cyan-400/40" />
          <div>
            <p className="text-sm font-extrabold text-white">RailSwap</p>
            <p className="text-[11px] font-semibold text-slate-400">Admin</p>
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
                  ? 'group flex items-center rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15'
                  : 'group flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          className="w-full rounded-xl bg-white/5 px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-white/10"
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
