import React, { useEffect } from 'react';
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
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import WebsiteVerify from './pages/WebsiteVerify';
import EmailVerify from './pages/EmailVerify';
import QRVerify from './pages/QRVerify';

import ScamCenter from './pages/ScamCenter';
import ScamLibrary from './pages/ScamLibrary';

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

  // Public views
  if (!token) {
    if (activeTab === 'auth_login' || activeTab === 'auth_signup' || activeTab === 'auth_forgot') {
      return <AuthPage />;
    }
    return <Landing />;
  }

  // Sidebar Layout for logged-in PARAKH users
  return (
    <div className="min-h-screen bg-brand-100 text-brand-800 flex flex-col md:flex-row font-sans antialiased selection:bg-accent-blue/15">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-brand-200 flex flex-col justify-between shrink-0 shadow-sm z-30">
        <div>
          {/* Brand logo */}
          <div className="p-4 border-b border-brand-200 flex items-center justify-center cursor-pointer" onClick={() => useStore.setState({ activeTab: 'dashboard' })}>
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
            <SidebarItem 
              icon="📚" 
              label="Scam Library" 
              tab="scam_library" 
              active={activeTab === 'scam_library'} 
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
            <SidebarItem 
              icon="⚙️" 
              label="System Settings" 
              tab="settings" 
              active={activeTab === 'settings'} 
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

        {/* User Card */}
        <div className="p-4 border-t border-brand-200 bg-brand-50 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-accent-blue/10 text-accent-blue font-bold flex items-center justify-center border border-accent-blue/20 shrink-0">
              {(user?.profile?.name || user?.email || 'I')[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-brand-800 truncate">
                {user?.profile?.name && user.profile.name.trim().length > 0
                  ? user.profile.name 
                  : (user?.email ? user.email.split('@')[0].split(/[\._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Investigator')}
              </p>
              <p className="text-[10px] text-brand-500 capitalize">{user?.role} Account</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-brand-500 hover:text-accent-red p-2 rounded-lg transition"
            title="Log Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main View Panel */}
      <main className="flex-grow min-h-screen bg-brand-100 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'cases' && <CaseWorkspace />}
        {activeTab === 'voice' && <VoiceVerify />}
        {activeTab === 'image' && <ImageVerify />}
        {activeTab === 'document' && <DocumentVerify />}
        {activeTab === 'reports' && <ForensicReport />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'website' && <WebsiteVerify />}
        {activeTab === 'email' && <EmailVerify />}
        {activeTab === 'qr' && <QRVerify />}

        {activeTab === 'scam_center' && <ScamCenter />}
        {activeTab === 'scam_library' && <ScamLibrary />}

        
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
