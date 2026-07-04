import React, { useState } from 'react';

export default function Verdict({ token, result, onReset }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const {
    verdict,
    similarityScore,
    syntheticScore,
    isMatch,
    isFake,
    matchedMember,
    audioPath,
    fileName
  } = result;

  const handleSaveToLog = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          familyMemberId: matchedMember ? matchedMember._id : null,
          audioPath,
          audioName: fileName || 'Voice Check Note',
          similarityScore,
          syntheticScore,
          verdict
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save to log');
      }

      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Determine styles and messages based on verdict
  let cardBg = 'bg-green-50 border-green-200';
  let badgeColor = 'bg-accent-green text-white';
  let icon = '✓';
  let titleText = '';
  let subText = '';
  let isDanger = false;

  const simPct = similarityScore !== null ? Math.round(similarityScore * 100) : null;
  const synthPct = Math.round(syntheticScore * 100);

  switch (verdict) {
    case 'matches_safe':
      titleText = `Matches ${matchedMember?.name}'s voice pattern`;
      subText = `This clip matches ${matchedMember?.name} and shows no AI-generated signs.`;
      break;
    case 'matches_ai':
      cardBg = 'bg-amber-50 border-amber-200';
      badgeColor = 'bg-accent-amber text-brand-900';
      icon = '⚠️';
      titleText = `Matches ${matchedMember?.name}'s voice but shows AI markers`;
      subText = `WARNING: The vocal patterns match ${matchedMember?.name}, but our analysis indicates this file was likely synthetic or deepfaked.`;
      isDanger = true;
      break;
    case 'mismatch_safe':
      cardBg = 'bg-amber-50 border-amber-200';
      badgeColor = 'bg-accent-amber text-brand-900';
      icon = '⚠️';
      titleText = `Does not match ${matchedMember?.name}'s voice`;
      subText = `This clip does NOT match ${matchedMember?.name}, although it shows no signs of being AI-generated. It is likely another real person.`;
      isDanger = true;
      break;
    case 'mismatch_ai':
      cardBg = 'bg-red-50 border-red-200';
      badgeColor = 'bg-accent-red text-white';
      icon = '🚨';
      titleText = `Voice mismatch & AI-generated warning`;
      subText = `CRITICAL: The voice does not match ${matchedMember?.name} AND shows clear signs of being AI-generated. This is highly suspicious.`;
      isDanger = true;
      break;
    case 'unknown_ai':
      cardBg = 'bg-red-50 border-red-200';
      badgeColor = 'bg-accent-red text-white';
      icon = '🚨';
      titleText = `AI-generated deepfake detected`;
      subText = `The voice does not match any enrolled member and is flagged as AI-generated.`;
      isDanger = true;
      break;
    case 'unknown_safe':
    default:
      cardBg = 'bg-green-50 border-green-200';
      badgeColor = 'bg-accent-teal text-white';
      icon = '✓';
      titleText = `Safe: No AI markers detected`;
      subText = `No family match was found, but the clip shows no signs of being AI-generated.`;
      break;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Card (Large Unambiguous Result) */}
      <div className={`border-l-8 p-6 rounded-2xl ${cardBg} shadow-sm space-y-3 transition duration-150`}>
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{icon}</span>
          <h2 className="text-2xl font-black tracking-tight text-brand-900 leading-tight">
            {titleText}
          </h2>
        </div>
        <p className="text-brand-700 text-lg leading-relaxed">{subText}</p>
      </div>

      {/* 2. Plain Language Explanation Grid */}
      <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-brand-900 border-b border-brand-100 pb-3">
          SachiAwaaz Security Verification Results
        </h3>

        <div className="grid grid-cols-1 gap-8">
          {/* Check 1: Personal Voice Match (Priority Differentiator) */}
          <div className="bg-brand-50 border border-brand-200 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="font-extrabold text-brand-900 text-lg sm:text-xl">
                Check 1: Does this match {matchedMember ? matchedMember.name : "your family"}'s voice?
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                similarityScore !== null 
                  ? (isMatch ? 'bg-green-100 text-accent-green' : 'bg-red-100 text-accent-red')
                  : 'bg-brand-200 text-brand-700'
              }`}>
                {similarityScore !== null 
                  ? (isMatch ? 'Voice Matches' : 'Voice Mismatch')
                  : 'No Profile to Compare'
                }
              </span>
            </div>
            
            {similarityScore !== null ? (
              <div className="space-y-2">
                <div className="w-full bg-brand-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${isMatch ? 'bg-accent-green' : 'bg-accent-red'}`} 
                    style={{ width: `${Math.max(0, Math.min(100, simPct))}%` }}
                  ></div>
                </div>
                <p className="text-brand-700 text-base leading-relaxed">
                  We checked the unique vocal signature against <strong>{matchedMember?.name}</strong>'s enrolled sample. The confidence score is <strong>{simPct}%</strong>.{' '}
                  {isMatch 
                    ? `This is a high-confidence match (above our 75% threshold), confirming the voice matches ${matchedMember?.name}'s authentic voiceprint.`
                    : `This voice print does not match ${matchedMember?.name} (below our 75% threshold).`}
                </p>
              </div>
            ) : (
              <p className="text-brand-600 text-base leading-relaxed">
                We could not run a personal match check because you haven't selected a claims-identity or enrolled any family profiles yet. Go to the "Family Members" tab to register voiceprints.
              </p>
            )}
          </div>

          {/* Check 2: Generic AI Detection (Supporting Signal) */}
          <div className="border border-brand-200 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="font-bold text-brand-700 text-base sm:text-lg">
                Check 2: Does this sound AI-generated? <span className="text-brand-400 font-normal text-sm">(Supporting Signal)</span>
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                isFake ? 'bg-amber-100 text-accent-amber' : 'bg-green-100 text-accent-green'
              }`}>
                {isFake ? 'AI Signature Detected' : 'Natural Speech'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-brand-100 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${isFake ? 'bg-accent-amber' : 'bg-accent-green'}`} 
                  style={{ width: `${synthPct}%` }}
                ></div>
              </div>
              <p className="text-brand-600 text-sm sm:text-base leading-relaxed">
                This check scans for generic synthetic artifacts (similar to tools like Hiya, Resemble AI, and Pindrop). The likelihood of this clip being AI-generated is <strong>{synthPct}%</strong>.{' '}
                {isFake 
                  ? '⚠️ Attention: The audio contains digital signatures typical of modern AI text-to-speech generators.'
                  : '✓ No digital speech-synthesis patterns were detected.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Safety Checklist & Disclaimer */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-brand-900 flex items-center space-x-2">
          🛡️ What to Do Next (Verify Safety)
        </h3>
        
        <p className="text-brand-700 text-base">
          Regardless of the AI verdict, always practice the following verification checklist:
        </p>

        <ul className="space-y-3.5 pl-1">
          <li className="flex items-start space-x-2.5">
            <span className="text-accent-blue text-lg font-bold">1.</span>
            <span className="text-brand-800 text-base leading-snug">
              <strong>Hang up and call back:</strong> Do not rely on numbers provided in the clip. Call your loved one back on their normal, saved contact number.
            </span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-accent-blue text-lg font-bold">2.</span>
            <span className="text-brand-800 text-base leading-snug">
              <strong>Ask for the family code word:</strong> Immediately request a pre-agreed secret code word that only your family members know.
            </span>
          </li>
          <li className="flex items-start space-x-2.5">
            <span className="text-accent-blue text-lg font-bold">3.</span>
            <span className="text-brand-800 text-base leading-snug">
              <strong>Do not transfer funds:</strong> Legitimate emergencies rarely prevent you from making a standard callback. Never send wire transfers, gift cards, or crypto under stress.
            </span>
          </li>
        </ul>

        {/* Safety Disclaimer */}
        <div className="border-t border-brand-200 pt-4 mt-2">
          <div className="bg-white border border-brand-300 rounded-xl p-3.5 text-brand-600 text-sm leading-relaxed">
            <span className="font-bold text-brand-800 block mb-1">⚠️ Safety Disclaimer</span>
            SachiAwaaz deepfake detection is a supporting helper tool. Artificial Intelligence models can make errors (false positives/negatives) and are not foolproof. Always prioritize direct human callback verification before taking action.
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-accent-red p-4 rounded-xl text-accent-red text-sm font-semibold">
          {error}
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onReset}
          className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-base shadow-sm min-h-[44px]"
        >
          Check Another Clip
        </button>
        
        <button
          onClick={handleSaveToLog}
          disabled={saved || saving}
          className={`flex-1 font-bold py-3.5 px-4 rounded-xl transition duration-150 text-base shadow-sm min-h-[44px] ${
            saved 
              ? 'bg-green-100 text-accent-green cursor-not-allowed border border-accent-green' 
              : 'bg-accent-teal hover:bg-teal-700 text-white'
          }`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved to Family Log' : 'Save to Family Log'}
        </button>
      </div>
    </div>
  );
}
