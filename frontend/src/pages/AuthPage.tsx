import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Logo from '../components/Logo';

export default function AuthPage() {
  const { login, setActiveTab } = useStore();
  
  // Tab: 'login' | 'signup' | 'forgot' | 'verify'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let endpoint = '/auth/login';
    let body: any = { email, password };

    if (mode === 'signup') {
      endpoint = '/auth/signup';
      body = { email, password, name };
    } else if (mode === 'forgot') {
      endpoint = '/auth/forgot-password';
      body = { email };
    } else if (mode === 'verify') {
      endpoint = '/auth/verify-email';
      body = { token: tokenInput };
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication operation failed.');
      }

      if (mode === 'login' || mode === 'signup') {
        login(data.token, data.user);
      } else if (mode === 'forgot') {
        setSuccess(`Reset link generated successfully (token: ${data.resetToken}).`);
        setMode('verify');
        setTokenInput(data.resetToken);
      } else if (mode === 'verify') {
        setSuccess('Account verified successfully. You can now sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-100 text-brand-850 min-h-screen flex flex-col items-center justify-center relative px-6 py-12 animate-fade-in" style={{ backgroundColor: '#FFF8F2' }}>
      
      {/* Back Button */}
      <div className="w-full max-w-md mb-4 flex justify-start z-10">
        <button
          type="button"
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-accent-blue transition bg-white border border-brand-200 py-1.5 px-3 rounded-xl shadow-md hover:scale-[1.01]"
        >
          <span>←</span> <span>Back to Home</span>
        </button>
      </div>

      {/* Background decoration */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-accent-blue/5 blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-brand-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-blue/10 rounded-bl-3xl blur-md"></div>
        
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center cursor-pointer mb-2" onClick={() => setActiveTab('landing')}>
            <Logo className="w-36 h-auto" showTagline={true} />
          </div>
          <p className="text-brand-500 text-xs font-devanagari font-semibold">
            {mode === 'login' && 'सत्य की खोज में आपका स्वागत है।'}
            {mode === 'signup' && 'नया अन्वेषण खाता तैयार करें।'}
            {mode === 'forgot' && 'खाता पहुँच पुनः प्राप्त करें।'}
            {mode === 'verify' && 'प्रमाणीकरण कोड सत्यापित करें।'}
          </p>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold p-4 rounded-xl mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="e.g. Arthur Pendragon"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {mode !== 'verify' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="e.g. secure@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-semibold text-accent-blue hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {mode === 'verify' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Verification Code / Token</label>
              <input
                type="text"
                required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="Enter reset or verification code"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md min-h-[44px]"
          >
            {loading ? 'Executing...' : (
              mode === 'login' ? 'Sign In' : (
                mode === 'signup' ? 'Create Account' : (
                  mode === 'forgot' ? 'Send Reset Instructions' : 'Verify Code'
                )
              )
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-brand-200 pt-6 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-brand-500">
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-accent-blue font-bold hover:underline">
                Sign up free
              </button>
            </p>
          ) : (
            <p className="text-brand-500">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-accent-blue font-bold hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
