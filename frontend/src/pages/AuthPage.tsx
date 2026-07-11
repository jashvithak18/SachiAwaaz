import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Logo from '../components/Logo';

import BackgroundEffects from '../components/BackgroundEffects';

// Mode flow: 'login' | 'signup' | 'forgot' | 'reset' | 'verify'
type Mode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

export default function AuthPage() {
  const { login, setActiveTab } = useStore();

  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-digit OTP split into individual cells
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [tokenInput, setTokenInput] = useState(''); // email-verify mode

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [countdown, setCountdown] = useState(0); // resend countdown

  // Code verification states
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  /* ── OTP helpers ── */
  const otpValue = otp.join('');

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;         // digits only
    const next = [...otp];
    next[idx] = val.slice(-1);              // only last digit
    setOtp(next);
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    paste.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setOtp(next);
    const lastFilled = Math.min(paste.length, 5);
    otpRefs.current[lastFilled]?.focus();
  };

  /* ── Password validation indicators ── */
  const hasCapital = /[A-Z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const hasMinLength = newPassword.length >= 6;
  const isPasswordValid = hasCapital && hasSpecial && hasMinLength;

  /* ── Resend countdown ── */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Verify Reset Code Only ── */
  const handleVerifyCode = async () => {
    if (otpValue.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setSuccess('');
    setVerifyingCode(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpValue }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed.');

      setSuccess('Reset code verified successfully! Now set your new password.');
      setCodeVerified(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code verification.');
    } finally {
      setVerifyingCode(false);
    }
  };

  /* ── Submit handlers ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (mode === 'reset') {
      if (!codeVerified) {
        setError('Please verify the reset code first.');
        return;
      }
      if (!isPasswordValid) {
        setError('Password does not meet the complexity requirements.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      let endpoint = '/auth/login';
      let body: Record<string, string> = { email, password };

      if (mode === 'signup') {
        endpoint = '/auth/signup';
        body = { email, password, name };
      } else if (mode === 'forgot') {
        endpoint = '/auth/forgot-password';
        body = { email };
      } else if (mode === 'reset') {
        endpoint = '/auth/reset-password';
        body = { email, code: otpValue, newPassword };
      } else if (mode === 'verify') {
        endpoint = '/auth/verify-email';
        body = { token: tokenInput };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Something went wrong.');

      if (mode === 'login' || mode === 'signup') {
        login(data.token, data.user);
      } else if (mode === 'forgot') {
        setSuccess(data.message);
        setOtp(['', '', '', '', '', '']);
        setCodeVerified(false);
        setMode('reset');
        setCountdown(60);
      } else if (mode === 'reset') {
        setSuccess('Password reset successfully!');
        setTimeout(() => {
          setSuccess('');
          setMode('login');
          setOtp(['', '', '', '', '', '']);
          setCodeVerified(false);
          setNewPassword('');
          setConfirmPassword('');
        }, 1800);
      } else if (mode === 'verify') {
        setSuccess('Account verified! You can now sign in.');
        setTimeout(() => setMode('login'), 1800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSuccess('A new code has been sent to your email.');
      setOtp(['', '', '', '', '', '']);
      setCodeVerified(false);
      setCountdown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Labels ── */
  const titles: Record<Mode, string> = {
    login:  'Welcome back',
    signup: 'Create an account',
    forgot: 'Forgot your password?',
    reset:  'Enter your reset code',
    verify: 'Verify your account',
  };
  const subtitles: Record<Mode, string> = {
    login:  'सत्य की खोज में आपका स्वागत है।',
    signup: 'नया अन्वेषण खाता तैयार करें।',
    forgot: 'खाता पहुँच पुनः प्राप्त करें।',
    reset:  'कोड दर्ज करें और नया पासवर्ड सेट करें।',
    verify: 'प्रमाणीकरण कोड सत्यापित करें।',
  };

  return (
    <div className="bg-brand-100 text-brand-850 min-h-screen flex flex-col items-center justify-center relative px-6 py-12 animate-fade-in"
      style={{ backgroundColor: '#F6F4EF' }}>
      <BackgroundEffects />

      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex justify-start z-10">
        <button
          type="button"
          onClick={() => mode === 'reset' ? setMode('forgot') : mode !== 'login' ? setMode('login') : setActiveTab('landing')}
          className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-accent-blue transition bg-white border border-brand-200 py-1.5 px-3 rounded-xl shadow-md hover:scale-[1.01]"
        >
          <span>←</span>
          <span>{mode === 'reset' ? 'Back to email entry' : mode !== 'login' ? 'Back to Sign In' : 'Back to Home'}</span>
        </button>
      </div>

      {/* Background glow */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-accent-blue/5 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-brand-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-blue/10 rounded-bl-3xl blur-md" />

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center cursor-pointer mb-3" onClick={() => setActiveTab('landing')}>
            <Logo className="w-36 h-auto" showTagline />
          </div>
          <h1 className="text-[17px] font-extrabold text-brand-800">{titles[mode]}</h1>
          <p className="text-brand-500 text-xs font-semibold mt-1" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
            {subtitles[mode]}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-semibold p-4 rounded-xl mb-5 flex items-start gap-2">
            <span className="mt-0.5">⚠</span><span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-semibold p-4 rounded-xl mb-5 flex items-start gap-2">
            <span className="mt-0.5">✓</span><span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── SIGNUP: name ── */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Full Name</label>
              <input
                type="text" required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="e.g. Arjun Sharma"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* ── Email (all modes except verify and reset) ── */}
          {mode !== 'verify' && mode !== 'reset' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Email Address</label>
              <input
                type="email" required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="e.g. you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* ── Password (login / signup) ── */}
          {(mode === 'login' || mode === 'signup') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                    className="text-xs font-semibold text-accent-blue hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password" required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {/* ── FORGOT: info banner ── */}
          {mode === 'forgot' && (
            <div className="rounded-2xl p-4 border text-[13px] leading-relaxed" style={{ backgroundColor: '#F6F4EF', borderColor: '#E4E1DA', color: '#4b4845' }}>
              Enter your email address and we'll send you a <strong>6-digit reset code</strong>. It expires in 15 minutes.
            </div>
          )}

          {/* ── RESET: email display + OTP + new password ── */}
          {mode === 'reset' && (
            <>
              {/* Show which email the code was sent to */}
              <div className="rounded-2xl p-4 border text-[13px]" style={{ backgroundColor: '#F6F4EF', borderColor: '#E4E1DA' }}>
                <p className="font-bold text-[11px] uppercase tracking-wider mb-1" style={{ color: '#666' }}>Code sent to</p>
                <p className="font-semibold" style={{ color: '#181818' }}>{email}</p>
              </div>

              {/* 6-digit OTP input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#666' }}>
                    6-Digit Reset Code
                  </label>
                  {codeVerified && (
                    <span className="text-[11px] font-bold text-accent-green flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={codeVerified}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-full aspect-square text-center text-[22px] font-extrabold rounded-xl border-2 focus:outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      style={{
                        borderColor: codeVerified ? '#3E5C4B' : (digit ? '#3E5C4B' : '#E4E1DA'),
                        backgroundColor: codeVerified ? '#3E5C4B08' : (digit ? '#3E5C4B0D' : '#FBFAF8'),
                        color: '#181818',
                        caretColor: '#3E5C4B',
                        maxWidth: '52px',
                      }}
                    />
                  ))}
                </div>

                {/* Verify Code and Resend panel */}
                {!codeVerified && (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0 || verifyingCode || loading}
                      className="text-[12px] font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: '#3E5C4B' }}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={otpValue.length < 6 || verifyingCode}
                      className="bg-brand-800 text-white font-bold py-2 px-5 rounded-lg text-xs shadow hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifyingCode ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                )}
              </div>

              {/* Password inputs (only visible when code is verified) */}
              {codeVerified && (
                <>
                  {/* New password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>
                      New Password
                    </label>
                    <input
                      type="password" required
                      className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                      placeholder="Enter new password"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    />

                    {/* Password requirements indicators */}
                    <div className="mt-2.5 space-y-1 bg-brand-50/50 rounded-xl p-3 border border-brand-200/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500 mb-1">Requirements:</p>
                      
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={hasMinLength ? "text-accent-green" : "text-brand-400"}>
                          {hasMinLength ? "✓" : "○"}
                        </span>
                        <span className={hasMinLength ? "text-brand-800 font-semibold" : "text-brand-500"}>
                          At least 6 characters
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={hasCapital ? "text-accent-green" : "text-brand-400"}>
                          {hasCapital ? "✓" : "○"}
                        </span>
                        <span className={hasCapital ? "text-brand-800 font-semibold" : "text-brand-500"}>
                          At least one Capital letter (A-Z)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={hasSpecial ? "text-accent-green" : "text-brand-400"}>
                          {hasSpecial ? "✓" : "○"}
                        </span>
                        <span className={hasSpecial ? "text-brand-800 font-semibold" : "text-brand-500"}>
                          At least one Special character (e.g. @, #, $, etc.)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password" required
                      className={`w-full border-2 focus:outline-none rounded-xl px-4 py-3 text-sm transition ${
                        confirmPassword && confirmPassword !== newPassword
                          ? 'border-accent-red bg-accent-red/5'
                          : 'bg-brand-50 border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue'
                      }`}
                      placeholder="Repeat new password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: '#A1493F' }}>Passwords don't match</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── VERIFY mode (email verification token) ── */}
          {mode === 'verify' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Verification Token</label>
              <input
                type="text" required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition"
                placeholder="Paste verification token here"
                value={tokenInput} onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>
          )}

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={
              loading || 
              (mode === 'reset' && (!codeVerified || !isPasswordValid || confirmPassword !== newPassword))
            }
            className="w-full font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md min-h-[44px] text-white disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#3E5C4B' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                {mode === 'forgot' ? 'Sending code…' : mode === 'reset' ? 'Resetting…' : 'Please wait…'}
              </span>
            ) : (
              mode === 'login'  ? 'Sign In'               :
              mode === 'signup' ? 'Create Account'         :
              mode === 'forgot' ? 'Send Reset Code'        :
              mode === 'reset'  ? 'Reset Password'         :
              'Verify Account'
            )}
          </button>
        </form>

        {/* ── Footer links ── */}
        <div className="mt-8 border-t border-brand-200 pt-6 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-brand-500">
              Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className="font-bold hover:underline" style={{ color: '#3E5C4B' }}>
                Sign up free
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-brand-500">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="font-bold hover:underline" style={{ color: '#3E5C4B' }}>
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-brand-500">
              Remember your password?{' '}
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); setOtp(['','','','','','']); setCodeVerified(false); }}
                className="font-bold hover:underline" style={{ color: '#3E5C4B' }}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
