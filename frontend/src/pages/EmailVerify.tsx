import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function EmailVerify() {
  const { token, setActiveTab } = useStore();
  const [headersInput, setHeadersInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setHeadersInput(''); // clear text if file uploaded
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile && !headersInput.trim()) {
      setError('Please upload a file or paste raw headers first.');
      return;
    }

    setLoading(true);
    setScanProgress(0);
    setResult(null);
    setError('');

    // Progress animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 6;
      });
    }, 150);

    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      } else {
        formData.append('headers', headersInput);
      }

      const response = await fetch(`${API_URL}/email/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed.');

      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 2800);

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-850 flex items-center space-x-3">
          <span>✉️</span> <span>Email Verification</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Inspect email file attachments (.eml / .msg) and raw mail headers for SPF, DKIM, and DMARC alignment.
        </p>
      </div>

      {!result && !loading && (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload block */}
            <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-brand-800 text-sm mb-1">Option A: Upload Email Document</h4>
                <p className="text-brand-500 text-xs">Upload standard mail copies like .eml, .msg files.</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".eml,.msg,.txt"
                onChange={handleFileChange}
                className="w-full text-xs text-brand-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200"
              />
              {uploadedFile && (
                <div className="text-xs font-bold text-accent-blue bg-white border border-accent-blue/20 rounded-xl p-2.5">
                  Selected: {uploadedFile.name}
                </div>
              )}
            </div>

            {/* Paste block */}
            <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-brand-800 text-sm mb-1">Option B: Paste Email Headers</h4>
                <p className="text-brand-500 text-xs">Copy and paste raw mail hops routing header logs.</p>
              </div>
              <textarea
                className="w-full h-24 bg-white border border-brand-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-accent-blue text-brand-800 font-mono"
                placeholder="Paste here..."
                value={headersInput}
                onChange={(e) => {
                  setHeadersInput(e.target.value);
                  setUploadedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition text-sm shadow-md"
          >
            🔍 Run Forensic Header Check
          </button>
        </form>
      )}

      {loading && (
        <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-800 font-bold text-lg">Parsing Auth Alignments & Hops...</p>
          <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden max-w-md mx-auto">
            <div className="bg-accent-blue h-full transition-all duration-150" style={{ width: `${scanProgress}%` }}></div>
          </div>
          <span className="text-brand-500 text-xs">{scanProgress}% completed</span>
        </div>
      )}

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-semibold p-4 rounded-xl">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Verdict */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider">VERDICT</span>
              {result.report.verdict === 'safe' && (
                <div className="text-accent-green text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>✓</span> Safe Headers
                </div>
              )}
              {result.report.verdict === 'suspicious' && (
                <div className="text-accent-amber text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>⚠️</span> Spoof Warning
                </div>
              )}
              {result.report.verdict === 'manipulated' && (
                <div className="text-accent-red text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>🚨</span> Spoofed Sender
                </div>
              )}
              <p className="text-xs text-brand-500 truncate max-w-[280px]">Subject: {result.details.subject}</p>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider block">TRUST METER</span>
              <div className="flex items-center justify-center gap-1 font-mono text-xs">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-4 h-6 rounded-md ${
                      idx < Math.round(result.report.authenticityScore / 10)
                        ? result.report.verdict === 'safe'
                          ? 'bg-accent-green'
                          : result.report.verdict === 'suspicious'
                          ? 'bg-accent-amber'
                          : 'bg-accent-red'
                        : 'bg-brand-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-brand-800 text-sm font-bold block">
                Score: {result.report.authenticityScore}%
              </span>
            </div>

            <div className="text-center md:text-right">
              <button
                onClick={() => setResult(null)}
                className="bg-brand-50 hover:bg-brand-200 border border-brand-200 text-brand-700 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                ← Back to Verification
              </button>
            </div>
          </div>

          {/* Authentication Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-5 shadow-sm text-center space-y-2">
              <span className="text-[10px] font-bold text-brand-550 block">SPF RECORD</span>
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${result.details.spf === 'PASS' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                {result.details.spf}
              </span>
            </div>
            <div className="bg-white border border-brand-200 rounded-3xl p-5 shadow-sm text-center space-y-2">
              <span className="text-[10px] font-bold text-brand-550 block">DKIM ALIGN</span>
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${result.details.dkim === 'PASS' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                {result.details.dkim}
              </span>
            </div>
            <div className="bg-white border border-brand-200 rounded-3xl p-5 shadow-sm text-center space-y-2">
              <span className="text-[10px] font-bold text-brand-550 block">DMARC POLICY</span>
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${result.details.dmarc === 'PASS' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                {result.details.dmarc}
              </span>
            </div>
          </div>

          {/* Routing Hops Visualization */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
              Interactive Hop Route Timeline
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">
              <div className="flex items-center space-x-3 bg-brand-50 border border-brand-200 p-3.5 rounded-2xl w-full md:w-auto shadow-sm">
                <span className="text-xl">💻</span>
                <div>
                  <h4 className="font-bold text-xs text-brand-850">Sender IP Hop</h4>
                  <p className="text-[10px] text-brand-500">{result.details.senderIp}</p>
                </div>
              </div>

              <div className="text-brand-400 font-bold text-xl md:rotate-0 rotate-90">→</div>

              <div className="flex items-center space-x-3 bg-brand-50 border border-brand-200 p-3.5 rounded-2xl w-full md:w-auto shadow-sm">
                <span className="text-xl">🛰️</span>
                <div>
                  <h4 className="font-bold text-xs text-brand-850">Auth Gateways</h4>
                  <p className="text-[10px] text-brand-500">SPF / DKIM verified</p>
                </div>
              </div>

              <div className="text-brand-400 font-bold text-xl md:rotate-0 rotate-90">→</div>

              <div className="flex items-center space-x-3 bg-brand-50 border border-brand-200 p-3.5 rounded-2xl w-full md:w-auto shadow-sm">
                <span className="text-xl">📥</span>
                <div>
                  <h4 className="font-bold text-xs text-brand-850">Target Sandbox</h4>
                  <p className="text-[10px] text-brand-500">{result.details.recipient}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Mismatches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Email Diagnostics
              </h3>
              <div className="space-y-2.5 text-xs text-brand-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Sender:</span>
                  <span className="font-bold truncate max-w-[200px]">{result.details.sender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Recipient:</span>
                  <span className="font-bold truncate max-w-[200px]">{result.details.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Display Name Spoofing:</span>
                  <span className={`font-bold ${result.details.displayNameSpoofing ? 'text-accent-red' : 'text-accent-green'}`}>
                    {result.details.displayNameSpoofing ? 'Detected' : 'Clean'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Reply-To Address Mismatch:</span>
                  <span className={`font-bold ${result.details.replyToMismatch ? 'text-accent-red' : 'text-accent-green'}`}>
                    {result.details.replyToMismatch ? 'Mismatch Detected' : 'Aligned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Malicious Links & Attachments
              </h3>
              <div className="space-y-3 text-xs">
                {result.details.suspiciousAttachments.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-accent-red">Suspicious Attachments:</span>
                    {result.details.suspiciousAttachments.map((att: string, i: number) => (
                      <div key={i} className="text-brand-650 bg-accent-red/5 p-2 rounded-xl">📎 {att}</div>
                    ))}
                  </div>
                )}
                {result.details.maliciousLinks.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-accent-red">Malicious Redirect Links:</span>
                    {result.details.maliciousLinks.map((lnk: string, i: number) => (
                      <div key={i} className="text-brand-650 bg-accent-red/5 p-2 rounded-xl truncate">🔗 {lnk}</div>
                    ))}
                  </div>
                )}
                {result.details.suspiciousAttachments.length === 0 && result.details.maliciousLinks.length === 0 && (
                  <div className="text-accent-green font-semibold">✓ Zero malicious links or attachments detected.</div>
                )}
              </div>
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="bg-brand-50 border border-brand-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-brand-500">Verdict Analysis</h4>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-accent-blue font-bold text-xs hover:underline focus:outline-none"
              >
                {showExplanation ? 'Hide Simple explanation' : 'Explain Like I\'m Not Technical'}
              </button>
            </div>
            {showExplanation ? (
              <p className="text-xs text-brand-700 leading-relaxed bg-white border border-brand-200 rounded-xl p-3.5 transition">
                {result.report.verdict === 'safe'
                  ? 'Everything looks good! This email is safe. It comes from a verified sender, and there are no dangerous links or files attached.'
                  : result.report.verdict === 'suspicious'
                  ? 'Be careful! This email looks a bit unusual. The sender\'s address doesn\'t match up perfectly, or it took a strange route to reach you. Double-check before replying or clicking links.'
                  : 'Alert! This is a dangerous email. Someone is pretending to be a company or person you trust (spoofing) to steal your information. Do not reply, click any links, or download any attachments!'}
              </p>
            ) : (
              <p className="text-xs text-brand-750 leading-relaxed font-medium">{result.report.aiExplanation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
