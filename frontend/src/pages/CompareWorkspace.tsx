import React, { useState } from 'react';

export default function CompareWorkspace() {
  const [activeType, setActiveType] = useState<'image' | 'voice' | 'document'>('image');
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileNum: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      if (fileNum === 1) setFile1(e.target.files[0]);
      else setFile2(e.target.files[0]);
      setResult(null);
    }
  };

  const handleRunComparison = () => {
    if (!file1 || !file2) return;
    setLoading(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    setTimeout(() => {
      // Mock result calculations based on activeType and file details
      let similarity = 94.2;
      let diffSummary = 'Minor adjustments in pixel boundary contrast, consistent with standard editor operations.';
      let metadataComp = [
        { label: 'File Type', v1: file1.type || 'image/jpeg', v2: file2.type || 'image/jpeg', match: file1.type === file2.type },
        { label: 'File Size', v1: `${(file1.size / 1024).toFixed(1)} KB`, v2: `${(file2.size / 1024).toFixed(1)} KB`, match: false },
        { label: 'Camera Make', v1: 'Apple', v2: 'None (Stripped)', match: false }
      ];

      if (activeType === 'voice') {
        similarity = 78.4;
        diffSummary = 'Voiceprint comparison displays pitch variance and mechanical phase alignments, suggesting high likelihood of AI cloning or synthetic mimicry.';
        metadataComp = [
          { label: 'Sample Rate', v1: '44100 Hz', v2: '16000 Hz', match: false },
          { label: 'Vocal Harmonics', v1: 'Natural human resonance', v2: 'Synthetic vocoder trace detected', match: false }
        ];
      } else if (activeType === 'document') {
        similarity = 99.8;
        diffSummary = 'Text comparison matches perfectly. However, the signature block has structural offset modifications, suggesting copy-paste tampering.';
        metadataComp = [
          { label: 'Author Application', v1: 'Microsoft Word', v2: 'Adobe Acrobat (Edited)', match: false },
          { label: 'Pages Count', v1: '2', v2: '2', match: true }
        ];
      }

      setResult({
        similarity,
        diffSummary,
        hash1: 'sha256-8f3a921d7b32ef8a1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
        hash2: 'sha256-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        metadataComp
      });
      setLoading(false);
    }, 1800);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-850 flex items-center space-x-3">
          <span>⚖️</span> <span>Multi-File Comparison</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Select two assets to compare side-by-side, evaluating metadata alignment, hashes, and content variances.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-brand-200 w-full sm:w-96 shadow-sm">
        {['image', 'voice', 'document'].map(type => (
          <button
            key={type}
            onClick={() => {
              setActiveType(type as any);
              setFile1(null);
              setFile2(null);
              setResult(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition capitalize ${
              activeType === type ? 'bg-accent-blue text-white shadow-sm' : 'text-brand-500 hover:text-brand-800'
            }`}
          >
            {type === 'voice' ? 'Audio' : type}
          </button>
        ))}
      </div>

      {/* Files Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md text-center space-y-4">
          <span className="text-2xl block">📁</span>
          <h3 className="font-bold text-brand-850 text-sm">Source File A</h3>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 1)}
            className="text-xs text-brand-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 cursor-pointer block mx-auto"
          />
          {file1 && (
            <div className="text-xs font-bold text-accent-blue bg-brand-50 p-2.5 rounded-xl truncate max-w-xs mx-auto border border-brand-200">
              {file1.name}
            </div>
          )}
        </div>

        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md text-center space-y-4">
          <span className="text-2xl block">📁</span>
          <h3 className="font-bold text-brand-850 text-sm">Source File B</h3>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 2)}
            className="text-xs text-brand-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 cursor-pointer block mx-auto"
          />
          {file2 && (
            <div className="text-xs font-bold text-accent-blue bg-brand-50 p-2.5 rounded-xl truncate max-w-xs mx-auto border border-brand-200">
              {file2.name}
            </div>
          )}
        </div>
      </div>

      {file1 && file2 && !result && !loading && (
        <button
          onClick={handleRunComparison}
          className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md"
        >
          🔍 Compare Selected Files
        </button>
      )}

      {loading && (
        <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-accent-blue rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-800 font-bold text-sm">Comparing metadata layers and computing hash matrices...</p>
          <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden max-w-md mx-auto">
            <div className="bg-accent-blue h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Comparison summary header */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider">Similarity Score</span>
              <h3 className={`text-4xl font-black ${result.similarity >= 90 ? 'text-accent-green' : 'text-accent-red'}`}>
                {result.similarity}%
              </h3>
              <p className="text-xs text-brand-550 mt-1">{result.similarity >= 90 ? 'High content alignment detected.' : 'Significant alterations or synthetic cloning signatures found.'}</p>
            </div>
            <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200 text-xs text-brand-700 leading-relaxed font-medium">
              <span className="font-bold text-brand-850 block mb-1">Content Variance Summary:</span>
              {result.diffSummary}
            </div>
          </div>

          {/* Visual comparison workspace - synchronized scrolling mockup */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
              Synchronized Content Viewer
            </h3>
            <div className="grid grid-cols-2 gap-4 h-[250px] overflow-y-auto border border-brand-200 rounded-2xl p-4 bg-brand-50 font-mono text-[11px] leading-relaxed">
              {/* Column 1 */}
              <div className="space-y-1 pr-2 border-r border-brand-250 select-none">
                <span className="text-[10px] font-bold text-brand-400 block mb-2">FILE A CONTENT</span>
                {activeType === 'document' ? (
                  <>
                    <p className="text-accent-green bg-accent-green/5 font-semibold">1. Standard Contract Agreement</p>
                    <p>2. Subject: Virtual Internship Placement</p>
                    <p>3. Authorized: HR Director Arthur Pendragon</p>
                    <p>4. Compensation: 45,000 INR per month</p>
                    <p>5. Security Deposit: None</p>
                  </>
                ) : activeType === 'voice' ? (
                  <>
                    <p className="text-accent-green bg-accent-green/5 font-semibold">Waveform analysis: Aligned pitch envelope</p>
                    <p>Frequency Range: 80Hz - 340Hz</p>
                    <p>Formant Harmonics: Clean fundamental resonance</p>
                    <p>Noise Level: Natural room environment</p>
                  </>
                ) : (
                  <>
                    <p className="text-accent-green bg-accent-green/5 font-semibold">Metadata header: EXIF block</p>
                    <p>Resolution: 3024 x 4032</p>
                    <p>Camera: Apple iPhone 14 Pro</p>
                    <p>Quantization table: Original matrix</p>
                  </>
                )}
              </div>

              {/* Column 2 */}
              <div className="space-y-1 pl-2 select-none">
                <span className="text-[10px] font-bold text-brand-400 block mb-2">FILE B CONTENT</span>
                {activeType === 'document' ? (
                  <>
                    <p className="text-accent-green bg-accent-green/5 font-semibold">1. Standard Contract Agreement</p>
                    <p>2. Subject: Virtual Internship Placement</p>
                    <p className="text-accent-red bg-accent-red/5 font-bold">3. Authorized: [Modified signature block Canva]</p>
                    <p>4. Compensation: 45,000 INR per month</p>
                    <p className="text-accent-red bg-accent-red/5 font-bold">5. Security Deposit: 12,000 INR required</p>
                  </>
                ) : activeType === 'voice' ? (
                  <>
                    <p className="text-accent-red bg-accent-red/5 font-semibold">Waveform analysis: Phase mismatch envelope</p>
                    <p>Frequency Range: 110Hz - 290Hz</p>
                    <p className="text-accent-red bg-accent-red/5">Formant Harmonics: AI Vocoder pattern (Mid-freq spikes)</p>
                    <p>Noise Level: Pure flat digital signal</p>
                  </>
                ) : (
                  <>
                    <p className="text-accent-red bg-accent-red/5 font-semibold">Metadata header: EXIF stripped</p>
                    <p>Resolution: 3024 x 4032</p>
                    <p className="text-accent-red bg-accent-red/5">Camera: None (Photoshop export)</p>
                    <p className="text-accent-red bg-accent-red/5">Quantization table: Adobe double-compressed matrix</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cryptographic hashes and metadata table side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Metadata alignment
              </h3>
              <div className="space-y-3 text-xs">
                {result.metadataComp.map((row: any, i: number) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-brand-50">
                    <span className="font-semibold text-brand-500">{row.label}:</span>
                    <div className="flex gap-2">
                      <span className="font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{row.v1}</span>
                      <span className="text-brand-400">vs</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${row.match ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>{row.v2}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500 pb-2 border-b border-brand-100">
                Cryptographic signatures
              </h3>
              <div className="space-y-3 text-[10px] font-mono">
                <div>
                  <span className="font-bold text-brand-500 block mb-1">File A Hash:</span>
                  <span className="bg-brand-50 p-2 rounded-xl block border border-brand-200 break-all select-all">{result.hash1}</span>
                </div>
                <div>
                  <span className="font-bold text-brand-500 block mb-1">File B Hash:</span>
                  <span className="bg-brand-50 p-2 rounded-xl block border border-brand-200 break-all select-all">{result.hash2}</span>
                </div>
                <div className="text-accent-red font-bold text-xs pt-1">
                  🚨 Cryptographic signatures do not align. Files are not identical.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
