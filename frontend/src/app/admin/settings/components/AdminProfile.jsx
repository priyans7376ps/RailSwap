'use client';

export default function AdminProfile({ profile, handleProfileChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Admin Profile</h3>
        <p className="mt-1 text-sm text-slate-400">Manage your personal admin account details.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
            <input 
              type="text"
              value={profile.name || ''}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <input 
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
            <input 
              type="text"
              value={profile.phone || ''}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Picture URL</label>
            <input 
              type="text"
              value={profile.profile_picture || ''}
              onChange={(e) => handleProfileChange('profile_picture', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
