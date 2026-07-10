import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function QRVerify() {
  const { token, setActiveTab } = useStore();
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processQRImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processQRImage(e.target.files[0]);
    }
  };

  const processQRImage = async (file: File) => {
    setLoading(true);
    setScanProgress(0);
    setResult(null);
    setError('');

    // Sweep progress bar
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 8;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/qr/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'QR processing failed.');

      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 2200);

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setActiveTab('dashboard');
          }}
          className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-accent-blue transition bg-white border border-brand-200 py-1.5 px-3 rounded-xl shadow-sm hover:scale-[1.01]"
        >
          <span>←</span> <span>Back to Dashboard</span>
        </button>
      </div>

      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-850 flex items-center space-x-3">
          <span>🔍</span> <span>QR Code Verification</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Upload QR code images to decode URLs and check reputation indicators without opening destinations.
        </p>
      </div>

      {!result && !loading && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition ${
            dragActive ? 'border-accent-blue bg-accent-blue/5' : 'border-brand-200 bg-white'
          }`}
        >
          <span className="text-5xl block mb-4">📷</span>
          <h3 className="text-lg font-bold text-brand-850 mb-1">Drag and Drop QR Image</h3>
          <p className="text-brand-500 text-xs mb-6">Supports .png, .jpg, .jpeg file formats.</p>
          <label className="bg-accent-blue hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs cursor-pointer shadow-md transition inline-block">
            Select File
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-800 font-bold text-lg">Decoding QR Code & Scanning Payload...</p>
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
          {/* Verdict Card */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider">SAFETY RATING</span>
              {result.report.verdict === 'safe' && (
                <div className="text-accent-green text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>✓</span> Safe Target
                </div>
              )}
              {result.report.verdict === 'suspicious' && (
                <div className="text-accent-amber text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>⚠️</span> Suspicious Redirects
                </div>
              )}
              {result.report.verdict === 'manipulated' && (
                <div className="text-accent-red text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>🚨</span> Phishing Payload
                </div>
              )}
              <p className="text-xs text-brand-500 truncate max-w-[280px]">Decoded: {result.details.decodedText}</p>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider block">PHISHING RISK</span>
              <div className="flex items-center justify-center gap-1 font-mono text-xs">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-4 h-6 rounded-md ${
                      idx < Math.round(result.details.phishingProbability / 10)
                        ? 'bg-accent-red'
                        : 'bg-brand-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-brand-800 text-sm font-bold block">
                Probability: {result.details.phishingProbability}%
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

          {/* Ownership & Trust Assessment */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
              Ownership & Trust Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-brand-500 uppercase text-[10px] tracking-wider block mb-1">QR Target Entity:</span>
                  {result.details.isUpi ? (
                    <div className="p-3 bg-brand-50 rounded-2xl border border-brand-200 space-y-1">
                      <div className="text-sm font-black text-brand-850">👤 {result.details.payeeName || 'Unknown Payee'}</div>
                      <div className="font-mono text-brand-600 text-[11px]">VPA: {result.details.payeeAddress || 'N/A'}</div>
                      {result.details.amount && <div className="text-accent-teal font-extrabold text-xs">Requested Amount: ₹{result.details.amount}</div>}
                      <div className="text-[10px] text-brand-500 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <span className="text-accent-teal">💳</span> UPI Payment Recipient
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-brand-50 rounded-2xl border border-brand-200 space-y-1">
                      <div className="text-sm font-black text-brand-850">🌐 {result.details.domain || 'Unknown Domain'}</div>
                      <div className="text-[10px] text-brand-500 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <span>🔗</span> Web Destination Target
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-brand-500 uppercase text-[10px] tracking-wider block mb-1">Authenticity & Safety:</span>
                  {result.report.verdict === 'safe' ? (
                    <div className="p-3 bg-accent-green/5 rounded-2xl border border-accent-green/20 space-y-1">
                      <div className="text-sm font-black text-accent-green flex items-center gap-1.5">
                        <span>✅</span> Genuine Target
                      </div>
                      <p className="text-brand-650 leading-relaxed text-[11px]">
                        This QR code points to a verified, safe payee or website. No threat indicators, spam patterns, or malicious redirects were detected.
                      </p>
                    </div>
                  ) : result.report.verdict === 'suspicious' ? (
                    <div className="p-3 bg-accent-amber/5 rounded-2xl border border-accent-amber/20 space-y-1">
                      <div className="text-sm font-black text-accent-amber flex items-center gap-1.5">
                        <span>⚠️</span> Unverified / Suspicious
                      </div>
                      <p className="text-brand-650 leading-relaxed text-[11px]">
                        Caution is advised. This destination uses unverified redirect paths or lacks verified domain credentials. Confirm ownership before paying or entering logins.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-accent-red/5 rounded-2xl border border-accent-red/20 space-y-1">
                      <div className="text-sm font-black text-accent-red flex items-center gap-1.5">
                        <span>🚨</span> Spam / Phishing Threat
                      </div>
                      <p className="text-brand-650 leading-relaxed text-[11px]">
                        Danger detected! This QR contains signatures matching malicious websites or unverified handles containing spam/scam indicators. Do NOT interact.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Safety Card - Never automatically open the website */}
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-accent-red">
              <span className="text-2xl">🛡️</span>
              <h3 className="font-black text-sm uppercase tracking-wider">Destination Sandbox Shield</h3>
            </div>
            <p className="text-xs text-brand-700 leading-relaxed">
              For your safety, PARAKH has intercepted the QR destination. We resolved the full redirect path in our cloud sandbox. 
              <strong> Review the diagnostics below before visiting.</strong>
            </p>
            <div className="bg-white border border-brand-200 p-4 rounded-2xl space-y-3">
              <div>
                <span className="text-[10px] font-bold text-brand-500 uppercase block mb-1">Expanded Final URL:</span>
                <span className="text-xs font-mono font-bold text-accent-blue block break-all bg-brand-50 p-2.5 rounded-xl border border-brand-200 select-all">{result.details.expandedUrl}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-brand-500">Shortened Mask:</span>
                  <span className="font-bold ml-1">{result.details.shortUrlDetection ? 'Detected (Risk)' : 'None'}</span>
                </div>
                <div>
                  <span className="font-semibold text-brand-500">Redirections:</span>
                  <span className="font-bold ml-1">{result.details.redirectDetection ? 'Active (Risk)' : 'Direct'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostics and explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Threat Indicators
              </h3>
              <div className="space-y-3">
                {result.report.anomalies.length === 0 ? (
                  <div className="text-accent-green text-xs font-semibold">✓ Zero malicious threat signatures detected.</div>
                ) : (
                  result.report.anomalies.map((anom: string, i: number) => (
                    <div key={i} className="flex items-start space-x-2 text-xs">
                      <span className="text-accent-red mt-0.5">⚠️</span>
                      <span className="text-brand-700 leading-normal">{anom}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-500">Forensic Analysis</h4>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-accent-blue font-bold text-xs hover:underline focus:outline-none"
                >
                  {showExplanation ? 'Hide Simple explanation' : 'Explain Like I\'m Not Technical'}
                </button>
              </div>
              {showExplanation ? (
                <p className="text-xs text-brand-700 leading-relaxed bg-white border border-brand-200 rounded-xl p-3.5 transition">
                  {result.details.isUpi ? (
                    result.report.verdict === 'safe'
                      ? `This is a genuine UPI Payment QR code. The payee VPA (${result.details.payeeAddress}) and name ("${result.details.payeeName}") are valid and free of suspicious keywords.`
                      : result.report.verdict === 'suspicious'
                      ? 'Be careful! This UPI code contains unverified payment handles or redirect anomalies. Verify the recipient before paying.'
                      : 'Alert! This UPI payment request is flagged as a scam handle or contains keywords associated with fraud lottery/refund messages.'
                  ) : (
                    result.report.verdict === 'safe'
                      ? 'This QR code is safe! It takes you directly to a well-known, verified website with no hidden tricks.'
                      : result.report.verdict === 'suspicious'
                      ? 'Be careful! This QR code uses a shortened link (like bit.ly) or redirects you multiple times, making it hard to see where it really goes.'
                      : 'Alert! This QR code is a scam. It points to a fake page designed to steal your money, credit card details, or bank login info.'
                  )}
                </p>
              ) : (
                <p className="text-xs text-brand-750 leading-relaxed font-medium">{result.report.aiExplanation}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
