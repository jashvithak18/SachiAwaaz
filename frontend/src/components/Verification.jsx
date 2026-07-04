import React, { useState, useEffect, useRef } from 'react';

export default function Verification({ token, onVerificationResult }) {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // Audio state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing voice patterns...');
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMembers();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/family`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const startRecording = async () => {
    setError('');
    setAudioBlob(null);
    setAudioUrl('');
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 20) {
            recorder.stop();
            setRecording(false);
            clearInterval(timerRef.current);
            return 20;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      setError('Could not access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e) => {
    setError('');
    setAudioBlob(null);
    setAudioUrl('');
    
    if (recording) {
      stopRecording();
    }

    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!audioBlob && !uploadedFile) {
      setError('Please record or upload a voice note/clip to analyze.');
      return;
    }

    setLoading(true);
    setLoadingText('Uploading voice clip...');
    
    // Cycle loading text for plain-language feedback
    const loadingTexts = [
      'Extracting vocal features...',
      'Comparing with enrolled voiceprints...',
      'Analyzing for synthetic/AI artifacts...',
      'Generating final safety verdict...'
    ];
    let textIdx = 0;
    const textInterval = setInterval(() => {
      setLoadingText(loadingTexts[textIdx]);
      textIdx = (textIdx + 1) % loadingTexts.length;
    }, 2000);

    const formData = new FormData();
    if (selectedMemberId) {
      formData.append('familyMemberId', selectedMemberId);
    }
    
    if (audioBlob) {
      formData.append('audio', audioBlob, 'check_sample.wav');
    } else {
      formData.append('audio', uploadedFile);
    }

    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify audio file.');
      }

      clearInterval(textInterval);
      
      // Pass raw analysis results back to App.jsx to display Screen 3 (Verdict)
      onVerificationResult({
        ...data,
        fileName: uploadedFile ? uploadedFile.name : `Recorded Note (${new Date().toLocaleTimeString()})`
      });
      
    } catch (err) {
      clearInterval(textInterval);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 max-w-md mx-auto text-center px-4">
        {/* Simple warm, clinical pulse indicator */}
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center border-2 border-accent-blue animate-pulse">
          <span className="text-2xl">🎙️</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-brand-900">Processing Audio</h3>
          <p className="text-brand-600 text-lg font-semibold animate-fade-in">
            {loadingText}
          </p>
        </div>
        <p className="text-brand-400 text-sm">
          Please do not close this window. This will only take a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Description */}
      <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-900 mb-2">Check a Voice Clip</h2>
        <p className="text-brand-600 text-base">
          Did a family member send a suspicious voice note, or did you receive a call from someone sounding like them asking for emergency help? Record or upload the clip below to check its identity and deepfake probability.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-accent-red p-4 rounded-xl text-accent-red text-base font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm space-y-8">
        {/* Step 1: Select claims who */}
        <div>
          <label className="block text-base font-bold text-brand-800 mb-2">
            Who does this voice claim to be?
          </label>
          <p className="text-brand-500 text-sm mb-3">
            Select a family member to compare, or leave blank to search all enrolled profiles.
          </p>
          <select
            className="w-full px-4 py-3 rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-base min-h-[44px]"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">🔎 Detect automatically (best matching voiceprint)</option>
            {members.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.relationship})
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Upload or record */}
        <div className="bg-brand-50 p-5 rounded-xl border border-brand-200 space-y-6">
          <label className="block text-base font-bold text-brand-800">
            Provide the Voice Note / Clip
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Record option */}
            <div className="bg-white p-4 rounded-xl border border-brand-200 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-brand-900 text-base mb-1">Record Audio</h4>
                <p className="text-brand-500 text-sm">
                  Record a clip played on speaker from another phone.
                </p>
              </div>

              {!recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-base min-h-[44px]"
                >
                  🎙️ Record audio
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-base animate-pulse min-h-[44px]"
                >
                  ⏹ Stop ({recordingSeconds}s / 20s)
                </button>
              )}
            </div>

            {/* Upload option */}
            <div className="bg-white p-4 rounded-xl border border-brand-200 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-brand-900 text-base mb-1">Upload File</h4>
                <p className="text-brand-500 text-sm">
                  Upload a voice note file received via messaging apps.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="audio/wav, audio/mp3, audio/m4a, audio/flac"
                onChange={handleFileUpload}
                className="w-full text-sm text-brand-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-100 file:text-brand-800 hover:file:bg-brand-200"
              />
            </div>
          </div>

          {audioUrl && (
            <div className="pt-2 space-y-2 border-t border-brand-200">
              <span className="text-sm font-bold text-brand-700 block">Clip Preview:</span>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-lg shadow-sm min-h-[44px]"
        >
          🔍 Run Verification & AI Check
        </button>
      </form>
    </div>
  );
}
