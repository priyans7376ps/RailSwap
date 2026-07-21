import os

components = {
    "GeneralSettings.jsx": "GeneralSettings",
    "PlatformSettings.jsx": "PlatformSettings",
    "SecuritySettings.jsx": "SecuritySettings",
    "PaymentSettings.jsx": "PaymentSettings",
    "VerificationSettings.jsx": "VerificationSettings",
    "NotificationSettings.jsx": "NotificationSettings",
    "EmailSettings.jsx": "EmailSettings",
    "StorageSettings.jsx": "StorageSettings",
    "AppearanceSettings.jsx": "AppearanceSettings",
    "AdminProfile.jsx": "AdminProfile",
    "AdminPassword.jsx": "AdminPassword",
    "SystemInfo.jsx": "SystemInfo"
}

template = """'use client';

export default function {name}({ settings, handleChange, isSaving }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="mt-1 text-sm text-slate-400">Manage your {name.lower().replace('settings', '')} preferences.</p>
        
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-500 italic">Work in progress...</p>
        </div>
      </div>
    </div>
  );
}
"""

base_dir = "frontend/src/app/admin/settings/components"
os.makedirs(base_dir, exist_ok=True)

for file, name in components.items():
    path = os.path.join(base_dir, file)
    with open(path, "w") as f:
        f.write(template.replace("{name}", name))

print("Scaffolded all setting components.")
