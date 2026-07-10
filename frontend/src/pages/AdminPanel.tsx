import React from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';

interface UserItem {
  _id: string;
  email: string;
  role: string;
  isVerified: boolean;
  profile?: {
    name?: string;
    company?: string;
  };
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalReports: number;
  avgTrustScore: number;
  mediaDistribution: {
    voice: number;
    image: number;
    document: number;
  };
}

export default function AdminPanel() {
  const { token } = useStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // 1. Fetch system statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json();
    }
  });

  // 2. Fetch all users
  const { data: users = [], refetch: refetchUsers } = useQuery<UserItem[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // 3. Fetch all system reports
  const { data: reports = [], refetch: refetchReports } = useQuery<any[]>({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    }
  });

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This will delete all their reports and settings.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        refetchUsers();
        refetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-accent-blue transition bg-white border border-brand-200 py-1.5 px-3 rounded-xl shadow-sm hover:scale-[1.01]"
        >
          <span>←</span> <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-800 flex items-center space-x-2">
          <span>🔑</span> <span>Administrative Control Panel</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Monitor system metrics, review system-wide forensic audits, and manage accounts.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-brand-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">System Users</span>
          <p className="text-4xl font-black text-brand-800 mt-2">{stats?.totalUsers || 0}</p>
          <span className="text-[10px] text-brand-500 mt-2 block">Total registered SaaS accounts.</span>
        </div>

        <div className="bg-white border border-brand-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Total Verification Files</span>
          <p className="text-4xl font-black text-brand-800 mt-2">{stats?.totalReports || 0}</p>
          <div className="text-[10px] text-brand-500 mt-2 flex justify-between">
            <span>🎙️ {stats?.mediaDistribution.voice || 0}</span>
            <span>🖼️ {stats?.mediaDistribution.image || 0}</span>
            <span>📄 {stats?.mediaDistribution.document || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-brand-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">System-wide Trust Avg</span>
          <p className="text-4xl font-black text-brand-850 mt-2">{stats?.avgTrustScore || 100}%</p>
          <span className="text-[10px] text-brand-500 mt-2 block">Average authenticity score globally.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User management */}
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-brand-800 border-b border-brand-200 pb-2">User Directory</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {users.map(u => (
              <div key={u._id} className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-brand-800 truncate max-w-[180px]">{u.profile?.name || 'No Name Set'}</p>
                  <p className="text-brand-500 truncate max-w-[180px]">{u.email}</p>
                  <p className="text-brand-500 uppercase tracking-widest text-[9px]">{u.role}</p>
                </div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="text-xs text-accent-red hover:bg-accent-red/10 border border-accent-red/20 px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global audit ledger */}
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-brand-800 border-b border-brand-200 pb-2">System Audit Ledger</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {reports.map(r => (
              <div key={r._id} className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex justify-between items-center text-xs">
                <div className="space-y-1 overflow-hidden">
                  <p className="font-bold text-brand-850 truncate max-w-[160px]">{r.fileName}</p>
                  <p className="text-brand-500 truncate">Account: {r.userId?.email || 'Unknown'}</p>
                  <p className="text-brand-500 capitalize">{r.mediaType} • Verdict: <span className="font-bold text-brand-600">{r.verdict}</span></p>
                </div>
                <span className="font-black text-brand-850 shrink-0 text-sm">{r.authenticityScore}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
