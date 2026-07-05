import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';

interface Report {
  _id: string;
  fileName: string;
  fileUrl: string;
  mediaType: 'voice' | 'image' | 'document';
  authenticityScore: number;
  riskScore: number;
  verdict: 'safe' | 'suspicious' | 'manipulated';
  aiExplanation: string;
  anomalies: string[];
  createdAt: string;
}

export default function Dashboard() {
  const { token, user, setActiveTab, notifications, markAsRead } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // React Query to fetch user reports list dynamically
  const { data: reports = [], isLoading, refetch } = useQuery<Report[]>({
    queryKey: ['userReports'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    }
  });

  // Calculate statistics from query data
  const totalCount = reports.length;
  const voiceCount = reports.filter(r => r.mediaType === 'voice').length;
  const imageCount = reports.filter(r => r.mediaType === 'image').length;
  const docCount = reports.filter(r => r.mediaType === 'document').length;
  
  const totalScore = reports.reduce((acc, r) => acc + r.authenticityScore, 0);
  const avgTrustScore = totalCount > 0 ? Math.round(totalScore / totalCount) : 100;

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || r.mediaType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Forensic Control Center</h2>
          <p className="text-brand-400 text-sm mt-1">
            Logged in as <span className="text-brand-200 font-bold">{user?.profile?.name || user?.email}</span> ({user?.role})
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => refetch()}
            className="bg-brand-850 hover:bg-brand-800 text-brand-200 px-4 py-2.5 rounded-xl font-semibold transition text-sm min-h-[44px]"
          >
            🔄 Refresh Data
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className="bg-accent-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm shadow-sm min-h-[44px]"
          >
            + Run Verification
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon="🛡️" label="Total Audits" value={totalCount} borderClass="border-brand-850" />
        <StatsCard icon="🎙️" label="Voice Analyses" value={voiceCount} borderClass="border-brand-850" />
        <StatsCard icon="🖼️" label="Image Forensics" value={imageCount} borderClass="border-brand-850" />
        <StatsCard icon="📄" label="Doc Integrity" value={docCount} borderClass="border-brand-850" />
        
        {/* Trust Score Card */}
        <div className="col-span-2 lg:col-span-1 bg-brand-950 border border-brand-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-brand-400">
            <span>Avg Trust Score</span>
            <span>🧠</span>
          </div>
          <div className="my-3">
            <span className={`text-4xl font-black ${
              avgTrustScore >= 75 ? 'text-accent-green' : (avgTrustScore >= 45 ? 'text-accent-amber' : 'text-accent-red')
            }`}>{avgTrustScore}%</span>
          </div>
          <p className="text-[10px] text-brand-500 leading-snug">Average authenticity score across all formats.</p>
        </div>
      </div>

      {/* Notifications Alert Banner (Real-time Socket.io warnings) */}
      {notifications.length > 0 && (
        <div className="bg-brand-950 border border-brand-850 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span>🔔</span> <span>Real-time Alert Ledger ({notifications.filter(n => !n.read).length} new)</span>
          </h3>
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
            {notifications.map((n) => (
              <div 
                key={n._id}
                className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                  n.read 
                    ? 'bg-brand-900/50 border-brand-850 text-brand-400' 
                    : 'bg-accent-blue/5 border-accent-blue/20 text-brand-100'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-bold">{n.title}</p>
                  <p className="text-brand-400">{n.message}</p>
                </div>
                {!n.read && (
                  <button 
                    onClick={() => markAsRead(n._id)}
                    className="text-[10px] text-accent-blue hover:underline font-bold px-2 py-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table / Recent Activity Section */}
      <div className="bg-brand-950 border border-brand-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-white">Recent Forensics Logs</h3>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search */}
            <input
              type="text"
              className="bg-brand-900 border border-brand-850 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-2 text-xs focus:outline-none placeholder-brand-500 transition w-full sm:w-48"
              placeholder="Search filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Filter */}
            <select
              className="bg-brand-900 border border-brand-850 focus:border-accent-blue rounded-xl px-4 py-2 text-xs focus:outline-none transition text-brand-300"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Formats</option>
              <option value="voice">🎙️ Voice</option>
              <option value="image">🖼️ Image</option>
              <option value="document">📄 Document</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-brand-400">Loading forensic reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16 text-brand-500">
            <span className="text-5xl block mb-3">📋</span>
            <p className="text-base font-bold">No forensic audits matched.</p>
            <p className="text-xs mt-1">Run an analysis to generate a verification ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-800 text-[10px] uppercase tracking-wider text-brand-500 font-bold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Media</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-850">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-brand-900/35 transition group">
                    <td className="py-3.5 px-4 text-xs text-brand-400">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate">
                      {report.fileName}
                    </td>
                    <td className="py-3.5 px-4 text-xs capitalize text-brand-300">
                      {report.mediaType === 'voice' && '🎙️ Voice'}
                      {report.mediaType === 'image' && '🖼️ Image'}
                      {report.mediaType === 'document' && '📄 Document'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider border uppercase ${
                        report.verdict === 'safe'
                          ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                          : (report.verdict === 'suspicious' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20')
                      }`}>
                        {report.verdict}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-brand-100">
                      {report.authenticityScore}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        onClick={() => setActiveTab(`report_detail:${report._id}`)}
                        className="text-xs bg-brand-800 group-hover:bg-accent-blue text-brand-200 group-hover:text-white px-3.5 py-1.5 rounded-lg transition duration-150"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  borderClass: string;
}

function StatsCard({ icon, label, value, borderClass }: StatsCardProps) {
  return (
    <div className={`bg-brand-950 border border-brand-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl`}>
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-brand-400">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <div className="my-3">
        <span className="text-4xl font-black text-white">{value}</span>
      </div>
      <p className="text-[10px] text-brand-500 leading-snug">Forensic files audited dynamically in this category.</p>
    </div>
  );
}
