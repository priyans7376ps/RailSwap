'use client';

export default function StorageSettings({ settings, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">Storage Settings</h3>
        <p className="mt-1 text-sm text-slate-400">Configure file storage providers and limitations.</p>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage Provider</label>
            <select 
              value={settings.storage_provider || 'local'}
              onChange={(e) => handleChange('storage_provider', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="local">Local Storage</option>
              <option value="cloudinary">Cloudinary</option>
              <option value="aws_s3">AWS S3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Allowed File Types</label>
            <input 
              type="text"
              placeholder="e.g. pdf,jpg,png"
              value={settings.allowed_file_types || ''}
              onChange={(e) => handleChange('allowed_file_types', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
