'use client';

import { useEffect, useState, useMemo } from 'react';
import { RequireAdminAuth } from '../protected/requireAdminAuth';
import { adminGetSettings, adminUpdateSettings, adminGetProfile, adminUpdateProfile, adminChangePassword } from '../../../services/api';

import GeneralSettings from './components/GeneralSettings';
import PlatformSettings from './components/PlatformSettings';
import SecuritySettings from './components/SecuritySettings';
import PaymentSettings from './components/PaymentSettings';
import VerificationSettings from './components/VerificationSettings';
import NotificationSettings from './components/NotificationSettings';
import EmailSettings from './components/EmailSettings';
import StorageSettings from './components/StorageSettings';
import AppearanceSettings from './components/AppearanceSettings';
import AdminProfile from './components/AdminProfile';
import AdminPassword from './components/AdminPassword';
import SystemInfo from './components/SystemInfo';

const TABS = [
  { id: 'general', label: 'General', component: GeneralSettings },
  { id: 'platform', label: 'Platform', component: PlatformSettings },
  { id: 'security', label: 'Security', component: SecuritySettings },
  { id: 'payments', label: 'Payments', component: PaymentSettings },
  { id: 'verification', label: 'Ticket Verification', component: VerificationSettings },
  { id: 'notifications', label: 'Notifications', component: NotificationSettings },
  { id: 'email', label: 'Email', component: EmailSettings },
  { id: 'storage', label: 'Storage', component: StorageSettings },
  { id: 'appearance', label: 'Appearance', component: AppearanceSettings },
  { id: 'profile', label: 'Admin Profile', component: AdminProfile },
  { id: 'password', label: 'Password', component: AdminPassword },
  { id: 'system', label: 'System', component: SystemInfo },
];

export default function AdminSettingsPage() {
  return (
    <RequireAdminAuth>
      <SettingsDashboard />
    </RequireAdminAuth>
  );
}

function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [settings, setSettings] = useState({});
  const [profile, setProfile] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [originalProfile, setOriginalProfile] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, profileRes] = await Promise.all([
        adminGetSettings(),
        adminGetProfile()
      ]);
      const s = settingsRes?.data || settingsRes || {};
      const p = profileRes?.profile || {};
      
      setSettings(s);
      setOriginalSettings(s);
      setProfile(p);
      setOriginalProfile(p);
      setHasUnsavedChanges(false);
    } catch (e) {
      showToast(e?.message || 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const resetChanges = () => {
    if (confirm("Are you sure you want to discard unsaved changes?")) {
      setSettings(originalSettings);
      setProfile(originalProfile);
      setHasUnsavedChanges(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'profile') {
        await adminUpdateProfile(profile);
        setOriginalProfile(profile);
        showToast("Profile updated successfully");
      } else if (activeTab === 'password') {
        // Handled directly in the component, so this branch won't really trigger unsaved changes globally
      } else {
        await adminUpdateSettings(settings);
        setOriginalSettings(settings);
        showToast("Settings updated successfully");
      }
      setHasUnsavedChanges(false);
    } catch (e) {
      showToast(e?.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const ActiveComponent = useMemo(() => {
    return TABS.find(t => t.id === activeTab)?.component;
  }, [activeTab]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
          <p className="text-sm text-slate-400">Manage all platform configurations and admin preferences.</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-amber-400">Unsaved changes</span>
            <button 
              onClick={resetChanges}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
            >
              Discard
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-cyan-600 px-6 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {toast.show && (
        <div className={`mb-6 rounded-xl border p-4 font-semibold ${toast.type === 'error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <nav className="flex flex-col space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {ActiveComponent && (
              <ActiveComponent 
                settings={settings} 
                profile={profile}
                handleChange={handleSettingsChange} 
                handleProfileChange={handleProfileChange}
                isSaving={saving}
                showToast={showToast}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
