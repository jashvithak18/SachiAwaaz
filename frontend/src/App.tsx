import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import Logo from './components/Logo';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VoiceVerify from './pages/VoiceVerify';
import ImageVerify from './pages/ImageVerify';
import DocumentVerify from './pages/DocumentVerify';
import CaseWorkspace from './pages/CaseWorkspace';
import ForensicReport from './pages/ForensicReport';
import AdminPanel from './pages/AdminPanel';
import WebsiteVerify from './pages/WebsiteVerify';
import EmailVerify from './pages/EmailVerify';
import QRVerify from './pages/QRVerify';

import ScamCenter from './pages/ScamCenter';
import ParticleBackground from './components/ParticleBackground';

export default function App() {
  const { token, user, activeTab, connectSocket, disconnectSocket, logout } = useStore();

  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            const formattedUser = {
              id: data._id || data.id,
              email: data.email,
              role: data.role,
              profile: data.profile
            };
            localStorage.setItem('aegis_user', JSON.stringify(formattedUser));
            useStore.setState({ user: formattedUser });
          }
        } catch (err) {
          console.error("Failed to fetch fresh user profile:", err);
        }
      };
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      connectSocket(user.id);
    }
    return () => {
      disconnectSocket();
    };
  }, [token, user]);

  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });

  // Mousemove listener for dynamic background spotlight
  useEffect(() => {
    if (!token) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const container = document.getElementById('main-app-container');
      if (container) {
        container.style.setProperty('--mouse-x', `${e.clientX}px`);
        container.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [token]);

  // Public views or landing page view even when logged in
  if (activeTab === 'landing') {
    return <Landing />;
  }

  if (!token) {
    if (activeTab === 'auth_login' || activeTab === 'auth_signup' || activeTab === 'auth_forgot') {
      return <AuthPage />;
    }
    return <Landing />;
  }

  // Sidebar Layout for logged-in PARAKH users
  return (
    <div id="main-app-container" className="min-h-screen spotlight-bg text-brand-800 flex flex-col md:flex-row font-sans antialiased selection:bg-accent-blue/15 relative overflow-hidden">
      <ParticleBackground />
      {/* Dynamic Cursor Spotlight Blob */}
      <div 
        className="pointer-events-none fixed rounded-full bg-accent-teal/8 blur-[120px] z-0 transition-all duration-300 ease-out hidden md:block"
        style={{
          left: `${mousePos.x - 220}px`,
          top: `${mousePos.y - 220}px`,
          width: '440px',
          height: '440px',
        }}
      />

      {/* Background Holographic Radars / Technical blueprint rings */}
      <svg className="fixed -right-24 -top-24 w-[480px] h-[480px] pointer-events-none opacity-20 z-0 select-none animate-[spin_260s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="#3E5C4B" strokeWidth="0.3">
        <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="38" />
        <circle cx="50" cy="50" r="28" strokeDasharray="6 6" />
        <line x1="50" y1="2" x2="50" y2="98" />
        <line x1="2" y1="50" x2="98" y2="50" />
      </svg>

      <svg className="fixed -left-20 -bottom-20 w-[380px] h-[380px] pointer-events-none opacity-15 z-0 select-none animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="#3E5C4B" strokeWidth="0.25">
        <circle cx="50" cy="50" r="45" />
        <polygon points="50,12 54,26 68,26 57,36 61,50 50,41 39,50 43,36 32,26 46,26" />
        <circle cx="50" cy="50" r="6" />
      </svg>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white/95 backdrop-blur-md border-r border-brand-200 flex flex-col justify-between shrink-0 shadow-sm z-30">
        <div>
          {/* Brand logo */}
          <div className="p-4 border-b border-brand-200 flex items-center justify-center cursor-pointer" onClick={() => useStore.setState({ activeTab: 'landing' })}>
            <Logo className="w-36 h-auto" showTagline={true} />
          </div>

          <nav className="p-4 space-y-1">
            <SidebarItem 
              icon="📊" 
              label="Dashboard" 
              tab="dashboard" 
              active={activeTab === 'dashboard'} 
            />
            
            <SidebarItem 
              icon="📂" 
              label="Case Workspace" 
              tab="cases" 
              active={activeTab === 'cases' || activeTab.startsWith('case_detail:')} 
            />

            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-brand-500 uppercase tracking-widest">
              Verification Engines
            </div>
            <SidebarItem 
              icon="🎙️" 
              label="Voice Authentication" 
              tab="voice" 
              active={activeTab === 'voice'} 
            />
            <SidebarItem 
              icon="🖼️" 
              label="Image Forensics" 
              tab="image" 
              active={activeTab === 'image'} 
            />
            <SidebarItem 
              icon="📄" 
              label="Document Integrity" 
              tab="document" 
              active={activeTab === 'document'} 
            />
            <SidebarItem 
              icon="🌐" 
              label="Website Verification" 
              tab="website" 
              active={activeTab === 'website'} 
            />
            <SidebarItem 
              icon="✉️" 
              label="Email Verification" 
              tab="email" 
              active={activeTab === 'email'} 
            />
            <SidebarItem 
              icon="🔍" 
              label="QR Verification" 
              tab="qr" 
              active={activeTab === 'qr'} 
            />


            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-brand-500 uppercase tracking-widest">
              Digital Trust
            </div>

            <SidebarItem 
              icon="🎓" 
              label="Scam Knowledge" 
              tab="scam_center" 
              active={activeTab === 'scam_center'} 
            />


            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-brand-500 uppercase tracking-widest">
              Management
            </div>
            <SidebarItem 
              icon="📋" 
              label="Forensic Ledger" 
              tab="reports" 
              active={activeTab === 'reports' || activeTab.startsWith('report_detail:')} 
            />
            {user?.role === 'admin' && (
              <>
                <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-accent-teal uppercase tracking-widest">
                  Admin Access
                </div>
                <SidebarItem 
                  icon="🔑" 
                  label="Control Panel" 
                  tab="admin" 
                  active={activeTab === 'admin'} 
                />
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main View Panel */}
      <main className="flex-grow min-h-screen bg-transparent overflow-y-auto relative z-10">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'cases' && <CaseWorkspace />}
        {activeTab === 'voice' && <VoiceVerify />}
        {activeTab === 'image' && <ImageVerify />}
        {activeTab === 'document' && <DocumentVerify />}
        {activeTab === 'reports' && <ForensicReport />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'website' && <WebsiteVerify />}
        {activeTab === 'email' && <EmailVerify />}
        {activeTab === 'qr' && <QRVerify />}

        {activeTab === 'scam_center' && <ScamCenter />}


        
        {/* Render detailed report separately */}
        {activeTab.startsWith('report_detail:') && (
          <ForensicReport reportId={activeTab.split(':')[1]} />
        )}

        {/* Render detailed case separately */}
        {activeTab.startsWith('case_detail:') && (
          <CaseWorkspace caseId={activeTab.split(':')[1]} />
        )}
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: string;
  label: string;
  tab: string;
  active: boolean;
}

function SidebarItem({ icon, label, tab, active }: SidebarItemProps) {
  const { setActiveTab } = useStore();
  
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition duration-200 ${
        active
          ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/10 font-bold'
          : 'text-brand-500 hover:bg-brand-100/70 hover:text-brand-800'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
