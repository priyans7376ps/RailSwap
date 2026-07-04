'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListUsers } from '../../../services/api';

export default function AdminUsersPage() {
  return (
    <RequireAdminAuth>
      <AdminUsers />
    </RequireAdminAuth>
  );
}

function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminListUsers({ page: 1, page_size: 10 });
        const list = res?.data?.users || res?.users || res?.data || [];
        setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage and review user accounts.</p>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading users...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-7 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-slate-300">
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Rating</div>
            <div>Verification</div>
            <div>Join Date</div>
            <div>Status</div>
          </div>

          <div className="divide-y divide-white/10">
            {users.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No users found.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-7 gap-2 px-4 py-3 text-sm text-slate-200"
                >
                  <div className="truncate font-semibold">{u.name}</div>
                  <div className="truncate text-slate-300">{u.email}</div>
                  <div className="truncate text-slate-400">{u.phone || '-'}</div>
                  <div className="text-slate-300">{u.rating ?? 0}</div>
                  <div className="text-slate-300">{u.is_verified ? 'Verified' : 'Pending'}</div>
                  <div className="text-slate-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</div>
                  <div className="text-slate-300">{u.status || 'active'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

