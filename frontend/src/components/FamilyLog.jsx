import React, { useState, useEffect } from 'react';

export default function FamilyLog({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch verification logs');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (verdict) => {
    switch (verdict) {
      case 'matches_safe':
        return 'bg-green-100 text-accent-green border-green-200';
      case 'unknown_safe':
        return 'bg-teal-100 text-accent-teal border-teal-200';
      case 'matches_ai':
      case 'mismatch_safe':
        return 'bg-amber-100 text-accent-amber border-amber-200';
      case 'mismatch_ai':
      case 'unknown_ai':
      default:
        return 'bg-red-100 text-accent-red border-red-200';
    }
  };

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'matches_safe':
        return '✓ Verified Match';
      case 'matches_ai':
        return '⚠️ AI Generated (Clone)';
      case 'mismatch_safe':
        return '⚠️ Speaker Mismatch';
      case 'mismatch_ai':
        return '🚨 Mismatch & AI Clone';
      case 'unknown_ai':
        return '🚨 Unknown AI Voice';
      case 'unknown_safe':
        return '✓ Real Voice (Unknown)';
      default:
        return 'Checked Clip';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-900">Family Verification Log</h2>
          <p className="text-brand-600 text-base mt-1">
            A secure, chronological history of voice checks performed by your family members.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-brand-100 hover:bg-brand-200 text-brand-800 font-bold py-2.5 px-4 rounded-xl transition text-base min-h-[44px]"
        >
          🔄 Refresh Log
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-accent-red p-4 rounded-xl text-accent-red text-base font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-brand-500 py-10 text-center text-lg">Loading history logs...</p>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-brand-200 rounded-2xl p-12 text-center shadow-sm">
          <span className="text-5xl block mb-3">📋</span>
          <h3 className="text-lg font-bold text-brand-900">No voice checks logged yet</h3>
          <p className="text-brand-500 mt-1 text-base">
            After running verification, save the verdict to populate this family security ledger.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log._id}
              className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-brand-300 transition duration-100"
            >
              {/* Header Info */}
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <span className="text-brand-400 text-sm font-semibold block">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                  <h4 className="font-bold text-lg text-brand-900 mt-0.5">{log.audioName}</h4>
                  
                  {log.familyMemberId && (
                    <p className="text-brand-500 text-sm font-medium mt-1">
                      Claims identity: <span className="text-brand-800 font-bold">{log.familyMemberId.name}</span> ({log.familyMemberId.relationship})
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1.5 rounded-xl border text-sm font-black shadow-sm ${getBadgeStyle(
                    log.verdict
                  )}`}
                >
                  {getVerdictLabel(log.verdict)}
                </span>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm">
                <div>
                  <span className="text-brand-500 font-medium block">Voice Matching:</span>
                  <span className="font-bold text-brand-800 text-base">
                    {log.similarityScore !== null ? `${Math.round(log.similarityScore * 100)}% similarity` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-brand-500 font-medium block">AI Synthetic Score:</span>
                  <span className="font-bold text-brand-800 text-base">
                    {Math.round(log.syntheticScore * 100)}% likelihood
                  </span>
                </div>
              </div>

              {/* Playback */}
              <div className="flex items-center space-x-3 bg-brand-50/50 p-2.5 rounded-xl border border-brand-100">
                <span className="text-xs font-bold text-brand-500">Audio Checked:</span>
                <audio
                  src={`${SERVER_URL}/${log.audioPath}`}
                  controls
                  className="flex-1 h-8"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
