'use client';

import { useState } from 'react';
import { adminChangePassword } from '../../../../services/api';

export default function AdminPassword({ showToast }) {
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [saving, setSaving] = useState(false);

  const strength = calculateStrength(passwords.new_password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return showToast("New passwords do not match", "error");
    }
    
    setSaving(true);
    try {
      await adminChangePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      showToast("Password changed successfully");
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (e) {
      showToast(e?.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Change Password</h3>
        <p className="mt-1 text-sm text-slate-400">Update your administrator password securely.</p>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
            <input 
              type="password"
              required
              value={passwords.current_password}
              onChange={(e) => setPasswords(p => ({ ...p, current_password: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
            <input 
              type="password"
              required
              minLength={6}
              value={passwords.new_password}
              onChange={(e) => setPasswords(p => ({ ...p, new_password: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
            
            {passwords.new_password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${strength >= i ? 'bg-emerald-500' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
            <input 
              type="password"
              required
              value={passwords.confirm_password}
              onChange={(e) => setPasswords(p => ({ ...p, confirm_password: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <button 
            type="submit"
            disabled={saving || !passwords.current_password || !passwords.new_password}
            className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-500 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function calculateStrength(pwd) {
  let score = 0;
  if (!pwd) return 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}
