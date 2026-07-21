'use client';

import { useEffect, useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminListUsers, adminUpdateUserStatus, adminDeleteUser } from '../../../services/api';

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
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminListUsers({ page: 1, page_size: 100 });
      const list = res?.data?.users || res?.users || res?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setProcessingId(userId);
      await adminUpdateUserStatus(userId, newStatus);
      await fetchUsers();
    } catch (e) {
      alert(e?.message || 'Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setProcessingId(userId);
      await adminDeleteUser(userId);
      await fetchUsers();
    } catch (e) {
      alert(e?.message || 'Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage and review user accounts.</p>
        </div>
      </div>

      {loading && users.length === 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading users...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {(!loading || users.length > 0) && !error && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-slate-300">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Verification</div>
            <div className="col-span-1">Join Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-white/10">
            {users.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No users found.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-200 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 truncate font-semibold">{u.name}</div>
                  <div className="col-span-2 truncate text-slate-300">{u.email}</div>
                  <div className="col-span-2 truncate text-slate-400">{u.phone || '-'}</div>
                  <div className="col-span-2 text-slate-300 flex flex-col text-xs">
                    <span>Email: {u.is_verified ? 'Verified' : 'Pending'}</span>
                    <span>Badge: {u.verification_badge ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="col-span-1 text-slate-400 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</div>
                  <div className="col-span-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === 'suspended' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {u.status || 'active'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {u.status === 'suspended' ? (
                      <button 
                        onClick={() => handleStatusChange(u.id, 'active')}
                        disabled={processingId === u.id || u.role === 'admin'}
                        className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        Activate
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusChange(u.id, 'suspended')}
                        disabled={processingId === u.id || u.role === 'admin'}
                        className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(u.id)}
                      disabled={processingId === u.id || u.role === 'admin'}
                      className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
