'use client';

import { useState } from 'react';
import { Star, ShieldCheck, Mail, Phone, Edit2, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RequireAuth from '../../components/RequireAuth';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../services/api';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      await refreshUser();
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently';

  return (
    <>
      <Navbar />
      <main className="page-shell py-10">
        <section className="glass-panel rounded-[2rem] p-8 md:p-12">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-cyan-100 ring-4 ring-white">
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-cyan-700 text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{user?.name}</h1>
                {user?.is_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {user?.phone || 'No phone added'}
                </div>
                <div className="flex items-center gap-2 font-medium text-amber-600">
                  <Star className="h-4 w-4 fill-amber-500" /> {user?.rating ? Number(user.rating).toFixed(1) : 'New'} Rating
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined {createdAt}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (editing) {
                  setName(user?.name || '');
                  setPhone(user?.phone || '');
                  setError('');
                  setSuccess('');
                }
                setEditing(!editing);
              }}
              className="btn-secondary shrink-0"
            >
              <Edit2 className="h-4 w-4" /> {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {editing && (
            <form onSubmit={handleSave} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 max-w-xl">
              <h2 className="text-lg font-bold text-slate-950">Update details</h2>
              <div className="mt-4 space-y-4">
                <label className="block space-y-2">
                  <span className="label">Full name</span>
                  <input
                    className="field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="label">Phone number</span>
                  <input
                    className="field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                  />
                </label>
                <div className="pt-2">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-950">Recent Reviews</h2>
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500">
            No reviews yet. Complete a ticket exchange to receive ratings.
          </div>
        </section>
      </main>
    </>
  );
}
