import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Enrollment from './components/Enrollment';
import Verification from './components/Verification';
import Verdict from './components/Verdict';
import FamilyLog from './components/FamilyLog';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('verification'); // Default tab is core action check clip
  const [verdictResult, setVerdictResult] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('verivoice_token');
    const savedUser = localStorage.getItem('verivoice_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setActiveTab('verification');
  };

  const handleSignOut = () => {
    localStorage.removeItem('verivoice_token');
    localStorage.removeItem('verivoice_user');
    setToken(null);
    setUser(null);
    setVerdictResult(null);
  };

  const handleVerificationResult = (result) => {
    setVerdictResult(result);
    setActiveTab('verdict');
  };

  // If not logged in, render simple Auth screen
  if (!token) {
    return (
      <div className="bg-lightBg min-h-screen">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-lightBg min-h-screen flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-brand-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">🎙️</span>
            <div>
              <h1 className="text-2xl font-black text-brand-900 tracking-tight leading-none">SachiAwaaz</h1>
              <span className="text-xs font-bold text-accent-blue tracking-wider block mt-1 uppercase">
                Is this really them?
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('verification');
                setVerdictResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold transition text-base min-h-[44px] ${
                activeTab === 'verification' || activeTab === 'verdict'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-brand-600 hover:bg-brand-100 hover:text-brand-800'
              }`}
            >
              🔍 Check Clip
            </button>
            <button
              onClick={() => {
                setActiveTab('enrollment');
                setVerdictResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold transition text-base min-h-[44px] ${
                activeTab === 'enrollment'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-brand-600 hover:bg-brand-100 hover:text-brand-800'
              }`}
            >
              👥 Family Members
            </button>
            <button
              onClick={() => {
                setActiveTab('log');
                setVerdictResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold transition text-base min-h-[44px] ${
                activeTab === 'log'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-brand-600 hover:bg-brand-100 hover:text-brand-800'
              }`}
            >
              📋 History Log
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl font-bold text-accent-red hover:bg-red-50 transition text-base min-h-[44px]"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-8">
        {activeTab === 'verification' && (
          <Verification token={token} onVerificationResult={handleVerificationResult} />
        )}
        {activeTab === 'verdict' && verdictResult && (
          <Verdict 
            token={token} 
            result={verdictResult} 
            onReset={() => {
              setVerdictResult(null);
              setActiveTab('verification');
            }} 
          />
        )}
        {activeTab === 'enrollment' && (
          <Enrollment token={token} />
        )}
        {activeTab === 'log' && (
          <FamilyLog token={token} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-200 py-6 text-center text-brand-400 text-sm font-medium">
        <p>© 2026 SachiAwaaz. HackHazards'26 Safety & Identity Track Prototype.</p>
        <p className="mt-1 text-xs">Remember: AI tools support verification, always perform a direct call callback in critical situations.</p>
      </footer>
    </div>
  );
}
