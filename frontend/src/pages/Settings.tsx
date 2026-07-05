import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';

export default function Settings() {
  const { token, user, login } = useStore();
  
  // Profile state
  const [name, setName] = useState(user?.profile?.name || '');
  const [company, setCompany] = useState(user?.profile?.company || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Settings state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [forensicThreshold, setForensicThreshold] = useState(75);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  useEffect(() => {
    if (settings) {
      setMfaEnabled(settings.mfaEnabled);
      setEmailNotifications(settings.emailNotifications);
      setForensicThreshold(settings.forensicThreshold);
    }
  }, [settings]);

  // Profile Update Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, company })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed.');

      login(token!, data);
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      setProfileError(err.message);
    }
  };

  // Settings Update Submit
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mfaEnabled, emailNotifications, forensicThreshold })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Settings update failed.');

      setSettingsSuccess('Forensic threshold preferences updated.');
    } catch (err: any) {
      setSettingsError(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-800 flex items-center space-x-2">
          <span>⚙️</span> <span>System Settings</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Configure security verification settings and user credentials profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Column 1: Profile credentials */}
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-brand-850 border-b border-brand-100 pb-2">
            Profile Details
          </h3>
          
          {profileError && (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold p-3.5 rounded-xl">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold p-3.5 rounded-xl">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Email (Static)</label>
              <input
                type="email"
                disabled
                className="w-full bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-400 cursor-not-allowed outline-none"
                value={user?.email}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition text-brand-800"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Company / Organization</label>
              <input
                type="text"
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition text-brand-800"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 text-xs shadow-sm min-h-[44px]"
            >
              Update Profile Credentials
            </button>
          </form>
        </div>

        {/* Column 2: System Settings */}
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-brand-850 border-b border-brand-100 pb-2">
            Forensic Configuration
          </h3>

          {settingsError && (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold p-3.5 rounded-xl">
              {settingsError}
            </div>
          )}

          {settingsSuccess && (
            <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold p-3.5 rounded-xl">
              {settingsSuccess}
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-brand-500 uppercase tracking-wider">Authenticity Alert Threshold</span>
                <span className="font-black text-accent-blue">{forensicThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="5"
                className="w-full h-1.5 bg-brand-100 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                value={forensicThreshold}
                onChange={(e) => setForensicThreshold(Number(e.target.value))}
              />
              <p className="text-[10px] text-brand-500 leading-normal">
                Verifications scoring below this authenticity score are immediately flagged as suspicious/manipulated.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-brand-50 border-brand-200 text-accent-blue focus:ring-accent-blue h-4 w-4"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <div>
                  <span className="text-xs font-bold text-brand-850">Email Forensic Logs</span>
                  <p className="text-[9px] text-brand-500 mt-0.5">Send a copy of generated verification PDFs to mail.</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-brand-50 border-brand-200 text-accent-blue focus:ring-accent-blue h-4.5 w-4.5"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                />
                <div>
                  <span className="text-xs font-bold text-brand-850">Simulated Multi-Factor Authentication</span>
                  <p className="text-[9px] text-brand-500 mt-0.5">Require secondary OTP token challenge upon logins.</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 text-xs shadow-sm min-h-[44px]"
            >
              Save Configurations
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
