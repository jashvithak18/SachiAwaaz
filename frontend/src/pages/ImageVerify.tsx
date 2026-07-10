import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import HindiLoader from '../components/HindiLoader';

export default function ImageVerify() {
  const { token, setActiveTab } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
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
      if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
      } else {
        setError('Only image formats (.jpg, .jpeg, .png) are allowed.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select or drag an image to verify.');
      return;
    }

    setIsVerifying(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/image/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Image verification failed.');

      setActiveTab(`report_detail:${data.report._id}`);
    } catch (err: any) {
      setError(err.message);
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-accent-blue transition bg-white border border-brand-200 py-1.5 px-3 rounded-xl shadow-sm hover:scale-[1.01]"
        >
          <span>←</span> <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-3xl font-black font-devanagari tracking-tight text-brand-850 flex items-center space-x-3">
          <span>🖼️</span> <span>छवि की परख (Image Forensics)</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Verify digital files for double compression quantization anomalies, metadata shifts, and AI pixel renderings.
        </p>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-semibold p-4 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {isVerifying ? (
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl">
          <HindiLoader title="Running Image Matrix Forensics" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Drag & Drop Area */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-350 hover:border-accent-blue bg-brand-50 hover:bg-brand-100/50 p-12 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg, image/jpg, image/png"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="text-4xl animate-bounce">📥</div>
            <div>
              <p className="text-sm font-bold text-brand-800">Drag and drop your image here</p>
              <p className="text-xs text-brand-500 mt-1">Supports JPG, JPEG, PNG (Max 10MB)</p>
            </div>
            <button
              type="button"
              className="bg-brand-200 hover:bg-brand-300 text-brand-750 px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px]"
            >
              Browse Files
            </button>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="bg-brand-50 border border-brand-200 p-5 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-brand-500 block">Preview Image:</span>
              <div className="max-h-[300px] overflow-hidden rounded-xl border border-brand-200 flex justify-center bg-white shadow-inner">
                <img src={previewUrl} alt="Upload preview" className="max-h-[300px] object-contain" />
              </div>
              <p className="text-xs text-brand-600 truncate">Evidence: <span className="font-bold text-brand-800">{file?.name}</span></p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md shadow-accent-teal/10 min-h-[44px]"
          >
            🔍 Run Image Forensic Audit
          </button>
        </form>
      )}
    </div>
  );
}
