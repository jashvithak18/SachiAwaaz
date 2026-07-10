import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function WebsiteVerify() {
  const { token, setActiveTab } = useStore();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setScanProgress(0);
    setResult(null);
    setError('');
    setAssistantMessages([]);

    // Progress simulation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    try {
      const response = await fetch(`${API_URL}/website/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: urlInput })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed.');
      
      // Wait for progress animation to complete
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 3200);

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  const handleAskAssistant = (q: string) => {
    if (!q.trim() || !result) return;
    const newMsgs = [...assistantMessages, { role: 'user' as const, text: q }];
    setAssistantMessages(newMsgs);
    setCustomQuestion('');

    let reply = "I can analyze certificate logs, domain keywords, and potential phishing vectors. Try asking 'Is my data encrypted?' or 'Why is this domain suspicious?'";
    const qLower = q.toLowerCase();
    if (qLower.includes('encrypt') || qLower.includes('https') || qLower.includes('ssl')) {
      reply = result.details.httpsAvailable 
        ? "Yes, this connection uses HTTPS with valid SSL encryption. Intercepting data transmitted to this domain is extremely difficult."
        : "No! This domain does not use HTTPS. Any credentials, codes, or private details you enter will transmit in plain text, visible to network eavesdroppers.";
    } else if (qLower.includes('suspicious') || qLower.includes('registrar') || qLower.includes('why')) {
      reply = `PARAKH flags this site as ${result.report.verdict.toUpperCase()} because: ${result.report.anomalies.join(' / ') || 'no suspicious factors were found.'}`;
    }

    setTimeout(() => {
      setAssistantMessages([...newMsgs, { role: 'assistant' as const, text: reply }]);
    }, 400);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-850 flex items-center space-x-3">
          <span>🌐</span> <span>Website Verification</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Perform real-time safety checks on links, subdomains, SSL logs, and homograph scams.
        </p>
      </div>

      {!result && !loading && (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Paste Target URL</label>
            <input
              type="text"
              required
              className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 text-brand-850"
              placeholder="e.g. https://axisbank-verification-upi.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition text-sm shadow-md"
          >
            🔍 Run Website Verification
          </button>
        </form>
      )}

      {loading && (
        <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-800 font-bold text-lg">Scanning Website Certificate & Registry...</p>
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
        <div className="space-y-6 animate-fade-in" id="forensic-report-render">
          {/* Main Verdict Card */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider">VERDICT</span>
              {result.report.verdict === 'safe' && (
                <div className="text-accent-green text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>✓</span> Likely Authentic
                </div>
              )}
              {result.report.verdict === 'suspicious' && (
                <div className="text-accent-amber text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>⚠️</span> Needs Review
                </div>
              )}
              {result.report.verdict === 'manipulated' && (
                <div className="text-accent-red text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>🚨</span> High Risk Scam
                </div>
              )}
              <p className="text-xs text-brand-500">Domain: {result.details.domain}</p>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider block">TRUST LEVEL</span>
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

          {/* Details & Logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Registry Diagnostics
              </h3>
              <div className="space-y-2.5 text-xs text-brand-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Registrar:</span>
                  <span className="font-bold">{result.details.registrar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Domain Age:</span>
                  <span className="font-bold">{result.details.domainAge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">HTTPS Encryption:</span>
                  <span className={`font-bold ${result.details.httpsAvailable ? 'text-accent-green' : 'text-accent-red'}`}>
                    {result.details.httpsAvailable ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">SSL Certificate:</span>
                  <span className={`font-bold ${result.details.sslValid ? 'text-accent-green' : 'text-accent-red'}`}>
                    {result.details.sslValid ? 'Valid/Active' : 'Unsigned/Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-500">Shortened Masking:</span>
                  <span className="font-bold">{result.details.shortenedUrl ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Phishing Threat Indicators
              </h3>
              <div className="space-y-3">
                {result.report.anomalies.length === 0 ? (
                  <div className="text-accent-green text-xs font-semibold">✓ Zero phishing signatures detected.</div>
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
          </div>

          {/* Simple Language Explainer */}
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
                  ? 'This website is safe to use! It has strong security encryption and is officially registered to a verified company.'
                  : result.report.verdict === 'suspicious'
                  ? 'Use caution. This website is very new or has incomplete security setups, which is common for copycat pages. Do not enter private details.'
                  : 'Danger! This is a fake website. It is designed to look exactly like a real bank, payment portal, or service to trick you into entering your password.'}
              </p>
            ) : (
              <p className="text-xs text-brand-750 leading-relaxed font-medium">{result.report.aiExplanation}</p>
            )}
          </div>

          {/* Q&A Assistant */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500">Ask PARAKH AI</h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {assistantMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-2xl text-xs max-w-[85%] ${msg.role === 'user' ? 'bg-accent-blue/10 text-brand-850 ml-auto' : 'bg-brand-50 text-brand-700 mr-auto'}`}>
                  <span className="font-bold block mb-1">{msg.role === 'user' ? 'You' : 'PARAKH AI'}</span>
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5 text-xs text-brand-850 outline-none"
                placeholder="Ask e.g. 'Is my connection secure?' or 'What is homograph?'"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant(customQuestion)}
              />
              <button
                onClick={() => handleAskAssistant(customQuestion)}
                className="bg-accent-blue hover:bg-blue-700 text-white font-bold px-4 rounded-xl text-xs transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
