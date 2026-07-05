import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';

interface Member {
  _id: string;
  name: string;
  relationship: string;
  audioPath: string;
}

export default function VoiceVerify() {
  const { token, setActiveTab } = useStore();
  
  // Section toggle: 'check' | 'enroll'
  const [activeSection, setActiveSection] = useState<'check' | 'enroll'>('check');

  // Check form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyBlob, setVerifyBlob] = useState<Blob | null>(null);
  const [verifyUrl, setVerifyUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgressText, setVerifyProgressText] = useState('Initiating check...');

  // Enroll form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [enrollFile, setEnrollFile] = useState<File | null>(null);
  const [enrollBlob, setEnrollBlob] = useState<Blob | null>(null);
  const [enrollUrl, setEnrollUrl] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Mic recording states
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  // React Query to fetch family list
  const { data: members = [], refetch: refetchMembers } = useQuery<Member[]>({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/voice/family`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch family members');
      return response.json();
    }
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Audio Recording Methods
  const startRecording = async (target: 'verify' | 'enroll') => {
    setError('');
    setSuccess('');
    
    // reset current targets
    if (target === 'verify') {
      setVerifyFile(null);
      setVerifyBlob(null);
      setVerifyUrl('');
    } else {
      setEnrollFile(null);
      setEnrollBlob(null);
      setEnrollUrl('');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        if (target === 'verify') {
          setVerifyBlob(blob);
          setVerifyUrl(url);
        } else {
          setEnrollBlob(blob);
          setEnrollUrl(url);
        }

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
      setError('Could not access your microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'verify' | 'enroll') => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (target === 'verify') {
      setVerifyFile(file);
      setVerifyBlob(null);
      setVerifyUrl(url);
    } else {
      setEnrollFile(file);
      setEnrollBlob(null);
      setEnrollUrl(url);
    }
  };

  // Submit Enrollment
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !relationship.trim()) {
      setError('Name and relationship are required.');
      return;
    }
    if (!enrollFile && !enrollBlob) {
      setError('Please record or upload a voice sample (10-20 seconds).');
      return;
    }

    setIsEnrolling(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('relationship', relationship);
    if (enrollBlob) {
      formData.append('audio', enrollBlob, 'enrollment_voice.wav');
    } else if (enrollFile) {
      formData.append('audio', enrollFile);
    }

    try {
      const response = await fetch(`${API_URL}/voice/family`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to enroll family member.');

      setSuccess(`Successfully enrolled ${name}!`);
      setName('');
      setRelationship('');
      setEnrollFile(null);
      setEnrollBlob(null);
      setEnrollUrl('');
      refetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Submit Verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verifyFile && !verifyBlob) {
      setError('Please record or upload a voice clip to analyze.');
      return;
    }

    setIsVerifying(true);
    setVerifyProgressText('Uploading audio file...');

    const progressTexts = [
      'Extracting spectral voiceprints...',
      'Matching pitch and similarity metrics...',
      'Scanning for digital vocoder noise...',
      'Computing synthetic deepfake markers...',
      'Writing secure forensic reports...'
    ];
    let step = 0;
    const progressInterval = setInterval(() => {
      setVerifyProgressText(progressTexts[step]);
      step = (step + 1) % progressTexts.length;
    }, 1800);

    const formData = new FormData();
    if (selectedMemberId) {
      formData.append('familyMemberId', selectedMemberId);
    }
    if (verifyBlob) {
      formData.append('audio', verifyBlob, 'verification_voice.wav');
    } else if (verifyFile) {
      formData.append('audio', verifyFile);
    }

    try {
      const response = await fetch(`${API_URL}/voice/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) throw new Error(data.message || 'Failed to execute verification.');

      // Redirect immediately to detailed Forensic Report details view
      setActiveTab(`report_detail:${data.report._id}`);

    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
      setIsVerifying(false);
    }
  };

  const handleMemberDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this enrolled speaker? This action deletes their biometric voiceprint.')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/voice/family/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccess('Speaker deleted.');
        refetchMembers();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2">
          <span>🎙️</span> <span>Voice Authenticity Module</span>
        </h2>
        <p className="text-brand-400 text-sm mt-1">
          Perform digital forensics comparing query clips against enrolled speaker voiceprints.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-brand-950 p-1.5 rounded-xl border border-brand-850 w-full sm:w-80">
        <button
          onClick={() => setActiveSection('check')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition ${
            activeSection === 'check' ? 'bg-accent-blue text-white' : 'text-brand-400 hover:text-white'
          }`}
        >
          Check Audio Clip
        </button>
        <button
          onClick={() => setActiveSection('enroll')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition ${
            activeSection === 'enroll' ? 'bg-accent-blue text-white' : 'text-brand-400 hover:text-white'
          }`}
        >
          Enroll Biometric
        </button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm font-semibold p-4 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm font-semibold p-4 rounded-xl">
          {success}
        </div>
      )}

      {isVerifying ? (
        <div className="bg-brand-950 border border-brand-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center animate-pulse">
            <span className="text-3xl">🎙️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Analyzing Speech Markers</h3>
            <p className="text-brand-400 text-lg animate-pulse font-semibold">{verifyProgressText}</p>
          </div>
        </div>
      ) : activeSection === 'check' ? (
        /* Checking section */
        <form onSubmit={handleVerifySubmit} className="bg-brand-950 border border-brand-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-400 tracking-wider mb-2">
              Who does this voice claim to be?
            </label>
            <select
              className="w-full bg-brand-900 border border-brand-850 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none transition text-brand-200"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-900/40 p-5 rounded-2xl border border-brand-850">
            {/* Record column */}
            <div className="bg-brand-950 p-5 rounded-xl border border-brand-850 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Record from MIC</h4>
                <p className="text-brand-500 text-xs">Capture speaker played on speaker/microphone.</p>
              </div>
              
              {!recording ? (
                <button
                  type="button"
                  onClick={() => startRecording('verify')}
                  className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition min-h-[44px]"
                >
                  🎙️ Record audio
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition animate-pulse min-h-[44px]"
                >
                  ⏹ Stop ({recordingSeconds}s / 20s)
                </button>
              )}
            </div>

            {/* Upload column */}
            <div className="bg-brand-950 p-5 rounded-xl border border-brand-850 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Upload Audio File</h4>
                <p className="text-brand-500 text-xs">Supported formats: .wav, .mp3, .m4a, .flac.</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, 'verify')}
                className="w-full text-xs text-brand-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-800 file:text-brand-200 hover:file:bg-brand-700"
              />
            </div>
          </div>

          {verifyUrl && (
            <div className="p-4 bg-brand-900 border border-brand-850 rounded-xl space-y-2">
              <span className="text-xs font-bold text-brand-400 block">Check Audio Preview:</span>
              <audio src={verifyUrl} controls className="w-full" />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md min-h-[44px]"
          >
            🔍 Run Forensic Verification
          </button>
        </form>
      ) : (
        /* Enrollment section */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Enroll Form */}
          <div className="bg-brand-950 border border-brand-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-brand-850 pb-3">
              Add New Speaker Profile
            </h3>
            
            <form onSubmit={handleEnrollSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-400 tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-brand-900 border border-brand-850 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-600 transition text-brand-200"
                  placeholder="e.g. Grandma, Dad, Arthur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-400 tracking-wider mb-2">Relationship</label>
                <input
                  type="text"
                  required
                  className="w-full bg-brand-900 border border-brand-850 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-600 transition text-brand-200"
                  placeholder="e.g. Grandmother, Husband"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>

              <div className="bg-brand-900/40 p-4 rounded-xl border border-brand-850 space-y-4">
                <label className="block text-xs font-bold uppercase text-brand-400 tracking-wider">
                  Provide Voice Sample (10-20 seconds)
                </label>
                <p className="text-[11px] text-brand-500 leading-relaxed italic">
                  This is the step other tools skip. Without it, we can only guess if a voice is fake — with it, we can tell you if it's actually your family.
                </p>

                <div className="flex gap-2">
                  {!recording ? (
                    <button
                      type="button"
                      onClick={() => startRecording('enroll')}
                      className="flex-1 bg-accent-blue hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition min-h-[44px]"
                    >
                      🎙️ Record sample
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex-1 bg-accent-red hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition animate-pulse min-h-[44px]"
                    >
                      ⏹ Stop ({recordingSeconds}s)
                    </button>
                  )}
                </div>

                <div className="text-center text-xs text-brand-600">OR</div>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'enroll')}
                  className="w-full text-xs text-brand-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-850 file:text-brand-200 hover:file:bg-brand-800"
                />

                {enrollUrl && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-brand-400 block mb-1">Preview:</span>
                    <audio src={enrollUrl} controls className="w-full" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isEnrolling}
                className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md min-h-[44px]"
              >
                {isEnrolling ? 'Generating Biometric Voiceprint...' : 'Enroll Speaker'}
              </button>
            </form>
          </div>

          {/* List Column */}
          <div className="bg-brand-950 border border-brand-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-brand-850 pb-3 flex justify-between items-center">
              Enrolled Speakers
              <span className="bg-brand-800 text-brand-200 text-xs px-2.5 py-1 rounded-full font-bold">
                {members.length} Enrolled
              </span>
            </h3>

            {members.length === 0 ? (
              <div className="text-center py-12 text-brand-500">
                <span className="text-3xl block mb-2">👥</span>
                <p className="text-sm font-semibold">No speakers enrolled yet.</p>
                <p className="text-xs mt-1">Enroll your team or family members to initiate verified checks.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-850 max-h-[400px] overflow-y-auto pr-1">
                {members.map(member => (
                  <div key={member._id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{member.name}</h4>
                        <p className="text-xs text-brand-500">Relationship: {member.relationship}</p>
                      </div>
                      <button
                        onClick={() => handleMemberDelete(member._id)}
                        className="text-accent-red hover:bg-accent-red/10 border border-accent-red/20 px-2.5 py-1 rounded-lg text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                    <audio src={`${SERVER_URL}/${member.audioPath}`} controls className="w-full h-8" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
