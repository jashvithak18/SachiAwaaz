import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function DocumentVerify() {
  const { token, setActiveTab } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progressText, setProgressText] = useState('Initiating check...');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError('');
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'docx' || ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
        setFile(droppedFile);
      } else {
        setError('Only document formats (.pdf, .docx, image formats) are allowed.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select or drag a document file to verify.');
      return;
    }

    setIsVerifying(true);
    setProgressText('Uploading document binaries...');

    const steps = [
      'Scanning document structure tree...',
      'Running optical character recognition (OCR)...',
      'Comparing font layers and alignments...',
      'Checking digital signature anchors...',
      'Writing secure forensic document ledger...'
    ];
    let idx = 0;
    const progressInterval = setInterval(() => {
      setProgressText(steps[idx]);
      idx = (idx + 1) % steps.length;
    }, 1800);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`${API_URL}/document/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) throw new Error(data.message || 'Document verification failed.');

      // Redirect immediately to detailed Forensic Report details view
      setActiveTab(`report_detail:${data.report._id}`);

    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2">
          <span>📄</span> <span>Document Integrity Module</span>
        </h2>
        <p className="text-brand-400 text-sm mt-1">
          Verify digital files, contracts, or scanned paper sheets for structural edits, font modifications, and metadata compilations.
        </p>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm font-semibold p-4 rounded-xl">
          {error}
        </div>
      )}

      {isVerifying ? (
        <div className="bg-brand-950 border border-brand-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center animate-pulse">
            <span className="text-3xl">📄</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Scanning Document Layers</h3>
            <p className="text-brand-400 text-lg animate-pulse font-semibold">{progressText}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-brand-950 border border-brand-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Drag & Drop Area */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-800 hover:border-accent-blue/50 bg-brand-900/20 hover:bg-brand-900/40 p-12 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="text-4xl">📥</div>
            <div>
              <p className="text-sm font-bold text-white">Drag and drop your document here</p>
              <p className="text-xs text-brand-500 mt-1">Supports PDF, DOCX, PNG, JPG (Max 15MB)</p>
            </div>
            <button
              type="button"
              className="bg-brand-800 hover:bg-brand-700 text-brand-200 px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px]"
            >
              Browse Files
            </button>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="bg-brand-900 border border-brand-850 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <span className="text-2xl shrink-0">📄</span>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-brand-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setFile(null)}
                className="text-brand-500 hover:text-accent-red text-xs px-2.5 py-1 transition"
              >
                Clear
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md min-h-[44px]"
          >
            🔍 Verify Document Integrity
          </button>
        </form>
      )}
    </div>
  );
}
