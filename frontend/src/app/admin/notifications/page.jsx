'use client';

import { useState } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminBroadcastNotification } from '../../../services/api';

export default function AdminNotificationsPage() {
  return (
    <RequireAdminAuth>
      <AdminNotifications />
    </RequireAdminAuth>
  );
}

function AdminNotifications() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // confirm block removed for embedded browser compatibility
    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      await adminBroadcastNotification(message);
      setSuccess("Broadcast sent successfully to all users.");
      setMessage('');
    } catch (e) {
      setError(e?.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-white">Notifications</h1>
        <p className="text-sm text-slate-400">Send platform-wide broadcast messages.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-6 text-emerald-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSend} className="mt-6 max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Broadcast Message</label>
          <textarea 
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message to send to all users (e.g. Maintenance Notice, Emergency Alerts)..."
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
          />
        </div>
        
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button 
            type="submit" 
            disabled={sending || !message.trim()}
            className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? 'Broadcasting...' : 'Send Broadcast'}
          </button>
        </div>
      </form>
    </div>
  );
}
