import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';

interface Report {
  _id: string;
  fileName: string;
  fileUrl: string;
  mediaType: 'voice' | 'image' | 'document' | 'website' | 'email' | 'qr' | 'link';
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
  const { token, user, setActiveTab, notifications, markAsRead, logout } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState(user?.profile?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.profile?.avatar || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am PARAKH AI, your digital trust companion. Ask me any doubts about scams, security audits, deepfakes, or verify anything suspicious.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: [...chatMessages, userMsg] })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'AI error');
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I couldn't process your request: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      { role: 'assistant', content: 'Hello! I am PARAKH AI, your digital trust companion. Ask me any doubts about scams, security audits, deepfakes, or verify anything suspicious.' }
    ]);
    handleRefresh();
  };

  useEffect(() => {
    if (user) {
      setEditName(user.profile?.name || '');
      setEditAvatar(user.profile?.avatar || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    setSaveLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, avatar: editAvatar })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed.');

      const formattedUser = {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        profile: data.profile
      };
      localStorage.setItem('aegis_user', JSON.stringify(formattedUser));
      useStore.setState({ user: formattedUser });
      
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowProfileEdit(false);
        setSaveSuccess('');
      }, 1500);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        setSaveError('Image size exceeds 200KB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [
    { type: 'image', value: '/avatars/detective_glass.png' },
    { type: 'image', value: '/avatars/female_detective.png' },
    { type: 'image', value: '/avatars/security_robot.png' },
    { type: 'image', value: '/avatars/sherlock_dog.png' },
    { type: 'emoji', value: '🕵️‍♂️' },
    { type: 'emoji', value: '👩‍💻' },
    { type: 'emoji', value: '👮‍♀️' },
    { type: 'emoji', value: '🤖' },
    { type: 'emoji', value: '🧠' }
  ];

  // 1. Fetch user reports dynamically
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

  // 2. Fetch user cases dynamically
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

  // Stats calculation
  const totalCount = reports.length;
  const voiceCount = reports.filter(r => r.mediaType === 'voice').length;
  const imageCount = reports.filter(r => r.mediaType === 'image').length;
  const docCount = reports.filter(r => r.mediaType === 'document').length;
  const websiteCount = reports.filter(r => r.mediaType === 'website').length;
  const emailCount = reports.filter(r => r.mediaType === 'email').length;
  const qrCount = reports.filter(r => r.mediaType === 'qr').length;
  const linkCount = reports.filter(r => r.mediaType === 'link').length;
  const activeCasesCount = casesList.filter(c => c.status === 'active').length;

  const totalScore = reports.reduce((acc, r) => acc + r.authenticityScore, 0);
  const avgTrustScore = totalCount > 0 ? Math.round(totalScore / totalCount) : 100;

  // Authentic vs Suspicious / Manipulated counts
  const authenticCount = reports.filter(r => r.verdict === 'safe').length;
  const suspiciousCount = reports.filter(r => r.verdict === 'suspicious').length;
  const dangerousCount = reports.filter(r => r.verdict === 'manipulated').length;

  // Determine most used tool
  const toolCounts = [
    { name: 'Image Forensics', count: imageCount, icon: '🖼️' },
    { name: 'Voice Authentication', count: voiceCount, icon: '🎙️' },
    { name: 'Document Integrity', count: docCount, icon: '📄' },
    { name: 'Website Verification', count: websiteCount, icon: '🌐' },
    { name: 'Email Verification', count: emailCount, icon: '✉️' },
    { name: 'QR Code Scanner', count: qrCount, icon: '🔍' },
    { name: 'Link Inspector', count: linkCount, icon: '🔗' }
  ];
  const sortedTools = [...toolCounts].sort((a, b) => b.count - a.count);
  const mostUsedTool = sortedTools[0].count > 0 ? `${sortedTools[0].icon} ${sortedTools[0].name}` : 'None';

  // Filter reports for display table
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || r.mediaType === filterType;
    return matchesSearch && matchesFilter;
  });

  const firstName = user?.profile?.name
    ? user.profile.name.trim().split(' ')[0]
    : (user?.email ? user.email.split('@')[0].split(/[\._-]/)[0] : 'Investigator');
  const greetingName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-slide-up">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-brand-800">Welcome back, {greetingName}!</h2>
          <p className="text-brand-500 text-xs mt-1">
            Investigator: <span className="text-accent-blue font-bold">
              {user?.profile?.name && user.profile.name.trim().length > 0
                ? user.profile.name 
                : (user?.email ? user.email.split('@')[0].split(/[\._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Investigator')}
            </span>
          </p>
        </div>
        
        {/* Profile Card Place */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileEdit(!showProfileEdit)}
            className="flex items-center space-x-3 bg-white border border-brand-200 hover:border-brand-350 p-2.5 pr-4 rounded-2xl shadow-sm cursor-pointer transition select-none hover:scale-[1.01]"
          >
            {user?.profile?.avatar ? (
              (user.profile.avatar.startsWith('data:image') || user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('/')) ? (
                <img 
                  src={user.profile.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-accent-blue/20" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-blue/10 border border-accent-blue/25 flex items-center justify-center text-xl">
                  {user.profile.avatar}
                </div>
              )
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-blue/10 text-accent-blue font-bold flex items-center justify-center border border-accent-blue/25">
                {(user?.profile?.name || user?.email || 'I')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-black text-brand-850">
                {user?.profile?.name || 'Investigator'}
              </p>
              <p className="text-[10px] text-brand-500 truncate max-w-[150px]">
                {user?.email}
              </p>
            </div>
            <span className="text-xs text-brand-400">▼</span>
          </div>

          {/* Edit Modal Popover */}
          {showProfileEdit && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-brand-250 p-5 rounded-2xl shadow-2xl z-50 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-brand-100 pb-2">
                <span className="text-xs font-bold text-brand-850 uppercase tracking-wide">Edit Investigator Profile</span>
                <button 
                  onClick={() => setShowProfileEdit(false)}
                  className="text-brand-400 hover:text-brand-700 text-sm font-black p-1"
                >
                  ✕
                </button>
              </div>

              {saveError && (
                <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-semibold p-2.5 rounded-xl">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-[10px] font-semibold p-2.5 rounded-xl">
                  {saveSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-brand-500 tracking-wider mb-1.5 font-bold">Investigator Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder-brand-400 text-brand-800 font-bold"
                    placeholder="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-brand-500 tracking-wider mb-1.5 font-bold">Choose Preset Avatar</label>
                  <div className="grid grid-cols-5 gap-2 pb-1.5 font-bold">
                    {presetAvatars.map((av) => (
                      <button
                        key={av.value}
                        type="button"
                        onClick={() => setEditAvatar(av.value)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition ${editAvatar === av.value ? 'bg-accent-blue/15 border-2 border-accent-blue' : 'bg-brand-50 border border-brand-200 hover:bg-brand-100'}`}
                      >
                        {av.type === 'image' ? (
                          <img src={av.value} alt="Avatar Preset" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">{av.value}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-brand-500 tracking-wider mb-1 font-bold">Or Upload Custom Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="w-full text-[10px] text-brand-550 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200"
                  />
                  <p className="text-[8px] text-brand-450 mt-1">PNG, JPG formats supported (max 200KB size).</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-brand-100 font-bold">
                  <button
                    type="button"
                    onClick={() => setShowProfileEdit(false)}
                    className="w-1/2 bg-brand-100 hover:bg-brand-200 text-brand-700 text-xs font-semibold py-2 px-3 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-1/2 bg-accent-blue hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition"
                  >
                    {saveLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>

                <div className="pt-2 border-t border-brand-100 font-bold">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full bg-accent-red/10 hover:bg-accent-red/20 text-accent-red text-xs font-black py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <span>🚪</span>
                    <span>Logout Account</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-500">
            <span>Total Audits</span>
            <span>🛡️</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-brand-850">{totalCount}</h3>
          </div>
          <p className="text-[10px] text-brand-500 leading-snug">Completed verification sessions across all modules.</p>
        </div>

        <div className="metric-card flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-500">
            <span>Average Trust Score</span>
            <span>🧠</span>
          </div>
          <div>
            <h3 className={`text-3xl font-black ${avgTrustScore >= 75 ? 'text-accent-green' : avgTrustScore >= 45 ? 'text-accent-amber' : 'text-accent-red'}`}>
              {avgTrustScore}%
            </h3>
          </div>
          <p className="text-[10px] text-brand-500 leading-snug">Average integrity score of scanned digital artifacts.</p>
        </div>

        <div className="metric-card flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-500">
            <span>Most Active Tool</span>
            <span>⚡</span>
          </div>
          <div>
            <h3 className="text-base font-black text-brand-800 truncate">{mostUsedTool}</h3>
          </div>
          <p className="text-[10px] text-brand-500 leading-snug">Forensic engine with highest volume of scans.</p>
        </div>

        <div className="metric-card flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-brand-500">
            <span>Authentic vs Suspicious</span>
            <span>⚖️</span>
          </div>
          <div className="flex gap-3 text-xs font-bold pt-1.5">
            <span className="text-accent-green">✓ {authenticCount} Ok</span>
            <span className="text-accent-red">⚠ {suspiciousCount + dangerousCount} Flagged</span>
          </div>
          <p className="text-[10px] text-brand-500 leading-snug">Ratio of clean logs against flagged risk detections.</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PARAKH AI Assistant */}
        <div className="lg:col-span-2 premium-card flex flex-col justify-between h-[340px] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E1DA]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
                <span>🧠</span> PARAKH AI
              </h3>
              <p className="text-xs text-brand-400 mt-0.5">Your cyber security & digital trust assistant</p>
            </div>
            <button 
              type="button"
              onClick={handleClearChat} 
              className="text-[10px] px-2 py-1 border border-brand-200 rounded-lg text-brand-500 hover:bg-brand-50 hover:text-brand-700 transition"
            >
              Clear Chat
            </button>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 text-xs scrollbar-thin">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#3E5C4B] text-[#F9F8F6] rounded-br-none shadow-sm' 
                    : 'bg-brand-50 text-brand-800 border border-brand-100 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#E4E1DA]">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Ask a question (e.g. 'What is a voice cloning deepfake?')..."
              className="flex-1 bg-brand-50/50 border border-[#E4E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3E5C4B] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-[#3E5C4B] text-[#F9F8F6] rounded-xl px-4 py-2 text-xs font-bold hover:bg-[#344E3F] transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
            >
              {chatLoading ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Risk Distribution Pie / Ring Chart */}
        <div className="premium-card flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500">Risk Distribution</h3>
            <p className="text-xs text-brand-400 mt-0.5">Scanned file classification breakdown</p>
          </div>

          <div className="flex justify-center items-center relative">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
              {/* Circle segments */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3.8" 
                strokeDasharray={`${totalCount > 0 ? Math.round((authenticCount / totalCount) * 100) : 100} ${totalCount > 0 ? 100 - Math.round((authenticCount / totalCount) * 100) : 0}`} 
                strokeDashoffset="0" 
              />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3.8" 
                strokeDasharray={`${totalCount > 0 ? Math.round((suspiciousCount / totalCount) * 100) : 0} ${totalCount > 0 ? 100 - Math.round((suspiciousCount / totalCount) * 100) : 100}`} 
                strokeDashoffset={`-${totalCount > 0 ? Math.round((authenticCount / totalCount) * 100) : 100}`} 
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-bold text-brand-500 block uppercase">Safe Ratio</span>
              <span className="text-lg font-black text-brand-850">
                {totalCount > 0 ? Math.round((authenticCount / totalCount) * 100) : 100}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-brand-650">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-green inline-block"></span>
                Authentic (Safe)
              </span>
              <span className="font-bold text-brand-800">{authenticCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-brand-650">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber inline-block"></span>
                Suspicious
              </span>
              <span className="font-bold text-brand-800">{suspiciousCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-brand-650">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-red inline-block"></span>
                Manipulated (Danger)
              </span>
              <span className="font-bold text-brand-800">{dangerousCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Ledger */}
      {notifications.length > 0 && (
        <div className="bg-white border border-brand-200 rounded-3xl p-5 shadow-sm space-y-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 premium-card space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-black text-brand-800">Forensics Log History</h3>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                className="glass-input !py-2 !px-3 text-xs w-full sm:w-44 text-brand-850"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="glass-input !py-2 !px-3 text-xs text-brand-600 bg-brand-50"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Formats</option>
                <option value="voice">🎙️ Voice</option>
                <option value="image">🖼️ Image</option>
                <option value="document">📄 Document</option>
                <option value="website">🌐 Website</option>
                <option value="email">✉️ Email</option>
                <option value="qr">🔍 QR Code</option>
                <option value="link">🔗 Link</option>
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
                    <th className="py-2.5 px-3">Target / Name</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3 text-right">Authenticity</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {filteredReports.slice(0, 8).map((report) => (
                    <tr key={report._id} className="premium-row hover:bg-brand-50/50 transition group">
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

        {/* Recent Cases */}
        <div className="premium-card space-y-4">
          <h3 className="text-lg font-black text-brand-800 border-b border-brand-100 pb-2 flex justify-between items-center">
            <span>Recent Cases</span>
            {activeCasesCount > 0 && (
              <span className="bg-accent-blue/10 text-accent-blue text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeCasesCount} Active
              </span>
            )}
          </h3>
          
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
