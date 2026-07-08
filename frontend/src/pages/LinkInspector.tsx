import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function LinkInspector() {
  const { token, setActiveTab } = useStore();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setScanProgress(0);
    setResult(null);
    setError('');

    // Sweep animation
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
      const response = await fetch(`${API_URL}/link/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: urlInput })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Inspection failed.');

      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 2500);

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
          <span>🔗</span> <span>Link Inspector</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Paste links to analyze certificate validity, tracking scripts, and malware risk percentages.
        </p>
      </div>

      {!result && !loading && (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Target Link to Inspect</label>
            <input
              type="text"
              required
              className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 text-brand-855"
              placeholder="e.g. http://bit.ly/claims-upi-bonus"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition text-sm shadow-md"
          >
            🔍 Inspect Link Safety
          </button>
        </form>
      )}

      {loading && (
        <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-800 font-bold text-lg">Retrieving Link Preview & Analyzing Trackers...</p>
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
          {/* Recommendation Card */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider">RECOMMENDATION</span>
              {result.details.recommendation === 'safe' && (
                <div className="text-accent-green text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>✓</span> Safe Link
                </div>
              )}
              {result.details.recommendation === 'proceed_carefully' && (
                <div className="text-accent-amber text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>⚠️</span> Proceed Carefully
                </div>
              )}
              {result.details.recommendation === 'dangerous' && (
                <div className="text-accent-red text-3xl font-black flex items-center justify-center md:justify-start gap-2">
                  <span>🚨</span> High Threat Link
                </div>
              )}
              <p className="text-xs text-brand-500 truncate max-w-[280px]">Target: {result.details.domain}</p>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider block">MALWARE PROBABILITY</span>
              <div className="w-full bg-brand-100 h-3 rounded-full overflow-hidden max-w-xs mx-auto">
                <div 
                  className={`h-full transition-all duration-300 ${
                    result.details.malwareProbability >= 50 
                      ? 'bg-accent-red' 
                      : result.details.malwareProbability >= 20 
                      ? 'bg-accent-amber' 
                      : 'bg-accent-green'
                  }`} 
                  style={{ width: `${result.details.malwareProbability}%` }}
                ></div>
              </div>
              <span className="text-brand-850 text-xs font-bold block">
                Risk Ratio: {result.details.malwareProbability}%
              </span>
            </div>

            <div className="text-center md:text-right">
              <button
                onClick={() => setActiveTab('reports')}
                className="bg-brand-50 hover:bg-brand-200 border border-brand-200 text-brand-700 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                💾 View in Ledger
              </button>
            </div>
          </div>

          {/* Screenshot Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md md:col-span-1 flex flex-col justify-center space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">Website Preview</h3>
              <div className="bg-brand-50 border border-brand-200 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative group">
                {result.details.previewUrl ? (
                  <img src={result.details.previewUrl} alt="Website preview screenshot" className="w-full h-full object-cover" onError={(e) => {
                    // Fallback if preview fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'p-4 text-center text-[10px] text-brand-400 font-bold';
                      fallback.innerText = 'PREVIEW SANDBOX BLOCKED (INSECURE OR EXPIRED CONNECTION)';
                      parent.appendChild(fallback);
                    }
                  }} />
                ) : (
                  <span className="text-xs font-bold text-brand-400">Preview Blocked</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Security Diagnostics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-brand-500 block">Certificate Status:</span>
                    <span className={`font-bold capitalize ${result.details.certificateStatus === 'valid' ? 'text-accent-green' : 'text-accent-red'}`}>
                      🛡️ {result.details.certificateStatus}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-brand-500 block">Domain Name:</span>
                    <span className="font-bold text-brand-800">{result.details.domain}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-brand-500 block">Tracking Scripts Detected:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {result.details.trackingDetection.map((tr: string, i: number) => (
                        <span key={i} className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {tr}
                        </span>
                      ))}
                      {result.details.trackingDetection.length === 0 && (
                        <span className="text-accent-green font-semibold">None (No tracking codes)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scam Indicators and explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Scam Threat Indicators
              </h3>
              <div className="space-y-3">
                {result.report.anomalies.length === 0 ? (
                  <div className="text-accent-green text-xs font-semibold">✓ Zero scam warning indicators found.</div>
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
                    ? 'This link is safe to visit! The website is properly encrypted, and we didn\'t find any hidden tracking scripts or malware.'
                    : result.report.verdict === 'suspicious'
                    ? 'Use caution. This link redirects you through hidden pages or lacks standard security encryption. It is best to avoid unless you are sure.'
                    : 'Do not click! This link is a trap. It leads to a fake website designed to steal your passwords or install harmful software on your device.'}
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
