'use client';

import { useMemo } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

export default function AdminShell({ children }) {
  const navClass = useMemo(
    () =>
      'sticky top-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-md',
    []
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200">
      <AdminSidebar />

      <div className="md:pl-64">
        <div className={navClass}>
          <AdminNavbar />
        </div>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

