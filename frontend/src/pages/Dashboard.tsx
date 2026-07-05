import React, { useState } from 'react';
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

interface Case {
  _id: string;
  title: string;
  description: string;
  reports: Report[];
  status: 'active' | 'closed';
  createdAt: string;
}

export default function Dashboard() {
  const { token, user, setActiveTab, notifications, markAsRead } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // 1. Fetch user reports list dynamically
  const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useQuery<Report[]>({
    queryKey: ['userReports'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    }
  });

  // 2. Fetch user cases list dynamically
  const { data: casesList = [], isLoading: casesLoading, refetch: refetchCases } = useQuery<Case[]>({
    queryKey: ['userCases'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cases');
      return response.json();
    }
  });

  const handleRefresh = () => {
    refetchReports();
    refetchCases();
  };

  // Calculate statistics from query data
  const totalCount = reports.length;
  const voiceCount = reports.filter(r => r.mediaType === 'voice').length;
  const imageCount = reports.filter(r => r.mediaType === 'image').length;
  const docCount = reports.filter(r => r.mediaType === 'document').length;
  const activeCasesCount = casesList.filter(c => c.status === 'active').length;
  
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
          <h2 className="text-3xl font-black tracking-tight text-brand-800">Forensics Center</h2>
          <p className="text-brand-500 text-xs mt-1">
            Investigator: <span className="text-accent-blue font-bold">
              {user?.profile?.name && user.profile.name.trim().length > 0
                ? user.profile.name 
                : (user?.email ? user.email.split('@')[0].split(/[\._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Investigator')}
            </span> ({user?.role})
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="bg-white hover:bg-brand-50 border border-brand-200 text-brand-600 px-4 py-2.5 rounded-xl font-semibold transition text-xs min-h-[44px]"
          >
            🔄 Refresh Data
          </button>
          <button 
            onClick={() => setActiveTab('voice')}
            className="bg-accent-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition text-xs shadow-md shadow-accent-blue/10 min-h-[44px]"
          >
            + New Verification
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard 
          icon={
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#3E5C4B" stroke="#181818" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11L11 13L15 9" stroke="#FBFAF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          } 
          label="Total Audits" 
          value={totalCount} 
        />
        <StatsCard icon="🎙️" label="Voice Files" value={voiceCount} />
        <StatsCard icon="🖼️" label="Image Files" value={imageCount} />
        <StatsCard icon="📂" label="Active Cases" value={activeCasesCount} />
        
        {/* Trust Score Card */}
        <div className="col-span-2 lg:col-span-1 bg-white border border-brand-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-500">
            <span>Avg Trust Score</span>
            <span>🧠</span>
          </div>
          <div className="my-3">
            <span className={`text-4xl font-black ${
              avgTrustScore >= 75 ? 'text-accent-green' : (avgTrustScore >= 45 ? 'text-accent-amber' : 'text-accent-red')
            }`}>{avgTrustScore}%</span>
          </div>
          <p className="text-[10px] text-brand-500 leading-snug">Average integrity score across evidence logs.</p>
        </div>
      </div>

      {/* Live Socket Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center space-x-2">
            <span>🔔</span> <span>Real-time Alert Ledger ({notifications.filter(n => !n.read).length} new)</span>
          </h3>
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
            {notifications.map((n) => (
              <div 
                key={n._id}
                className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                  n.read 
                    ? 'bg-brand-50/50 border-brand-200 text-brand-500' 
                    : 'bg-accent-blue/5 border-accent-blue/15 text-brand-800'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-bold">{n.title}</p>
                  <p className="text-brand-500">{n.message}</p>
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

      {/* Cases list summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Reports list */}
        <div className="lg:col-span-2 bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-black text-brand-800">Forensics Log History</h3>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                className="bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-2 text-xs focus:outline-none placeholder-brand-400 transition w-full sm:w-44"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600"
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

          {reportsLoading ? (
            <div className="text-center py-16 text-brand-400">Loading forensic reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-brand-500">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-xs font-semibold">No records matched.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-200 text-[10px] uppercase tracking-wider text-brand-500 font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3 text-right">Authenticity</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-brand-50/50 transition group">
                      <td className="py-3 px-3 text-brand-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-800 max-w-[140px] truncate">
                        {report.fileName}
                      </td>
                      <td className="py-3 px-3 capitalize text-brand-650">
                        {report.mediaType}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${
                          report.verdict === 'safe'
                            ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                            : (report.verdict === 'suspicious' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20')
                        }`}>{report.verdict}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-brand-800">
                        {report.authenticityScore}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => setActiveTab(`report_detail:${report._id}`)}
                          className="text-[10px] bg-brand-100 hover:bg-accent-blue text-brand-700 hover:text-white px-2.5 py-1 rounded-lg transition"
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

        {/* Right 1 col: Recent Cases list */}
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-brand-800 border-b border-brand-100 pb-2">Recent Cases</h3>
          
          {casesLoading ? (
            <p className="text-center py-10 text-xs text-brand-400">Loading cases...</p>
          ) : casesList.length === 0 ? (
            <div className="text-center py-8 text-brand-500">
              <span className="text-2xl block mb-1">📂</span>
              <p className="text-xs">No active cases.</p>
              <button 
                onClick={() => setActiveTab('cases')}
                className="text-[10px] text-accent-blue font-bold hover:underline mt-2"
              >
                Create case
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {casesList.slice(0, 4).map(c => (
                <div 
                  key={c._id}
                  onClick={() => setActiveTab(`case_detail:${c._id}`)}
                  className="p-3.5 bg-brand-50 hover:bg-accent-blue/5 border border-brand-200 rounded-2xl cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-brand-800 truncate">{c.title}</h4>
                    <p className="text-[10px] text-brand-500 mt-1 truncate">{c.description || 'No description.'}</p>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-brand-400 mt-3 border-t border-brand-200/50 pt-2">
                    <span>📂 {c.reports.length} Evidence files</span>
                    <span className="capitalize font-bold text-accent-blue">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatsCard({ icon, label, value }: StatsCardProps) {
  return (
    <div className="bg-white border border-brand-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-500">
        <span>{label}</span>
        <span className="shrink-0 flex items-center">{icon}</span>
      </div>
      <div className="my-3">
        <span className="text-4xl font-black text-brand-800">{value}</span>
      </div>
      <p className="text-[9px] text-brand-500 leading-snug">Forensic files audited dynamically.</p>
    </div>
  );
}
