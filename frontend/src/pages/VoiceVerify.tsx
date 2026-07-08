import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import HindiLoader from '../components/HindiLoader';

interface Member {
  _id: string;
  name: string;
  relationship: string;
  audioPath: string;
  audioBase64?: string;
}

// WAV Encoder Helpers
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWAV = (samples: Float32Array, sampleRate: number) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM = 1
  view.setUint16(22, 1, true); // Mono = 1
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate (sampleRate * channelCount * bytesPerSample)
  view.setUint16(32, 2, true); // Block align (channelCount * bytesPerSample)
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
};

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

  // Audio Context and ScriptProcessor references
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedSamplesRef = useRef<number[]>([]);
  const recordingTargetRef = useRef<'verify' | 'enroll' | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  // Fetch family list
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
      // Clean up stream if recording is unmounted
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Mic Recording methods
  const startRecording = async (target: 'verify' | 'enroll') => {
    setError('');
    setSuccess('');
    recordingTargetRef.current = target;
    
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
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      recordedSamplesRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        for (let i = 0; i < inputData.length; i++) {
          recordedSamplesRef.current.push(inputData[i]);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 20) {
            stopRecordingInternal();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      setError('Mic access denied.');
    }
  };

  const stopRecording = () => {
    stopRecordingInternal();
  };

  const stopRecordingInternal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current) {
      const sampleRate = audioContextRef.current.sampleRate;
      audioContextRef.current.close();
      audioContextRef.current = null;

      // Encode WAV
      const samples = new Float32Array(recordedSamplesRef.current);
      const blob = encodeWAV(samples, sampleRate);
      const url = URL.createObjectURL(blob);

      const target = recordingTargetRef.current;
      if (target === 'verify') {
        setVerifyBlob(blob);
        setVerifyUrl(url);
      } else {
        setEnrollBlob(blob);
        setEnrollUrl(url);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

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
      setError('Record or upload a voice sample (10-20 seconds).');
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
      if (!response.ok) throw new Error(data.message || 'Verification failed.');

      setActiveTab(`report_detail:${data.report._id}`);
    } catch (err: any) {
      setError(err.message);
      setIsVerifying(false);
    }
  };

  const handleMemberDelete = async (id: string) => {
    if (!window.confirm('Delete this speaker?')) return;
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
        <h2 className="text-3xl font-black font-devanagari tracking-tight text-brand-850 flex items-center space-x-3">
          <span>🎙️</span> <span>आवाज़ की परख (Voice Authentication)</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Verify voice authentication clips and verify synthetic digital artifacts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-brand-200 w-full sm:w-80 shadow-sm">
        <button
          onClick={() => setActiveSection('check')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition ${
            activeSection === 'check' ? 'bg-accent-blue text-white' : 'text-brand-500 hover:text-brand-800'
          }`}
        >
          Check Audio Clip
        </button>
        <button
          onClick={() => setActiveSection('enroll')}
          className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition ${
            activeSection === 'enroll' ? 'bg-accent-blue text-white' : 'text-brand-500 hover:text-brand-800'
          }`}
        >
          Enroll Biometric
        </button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-semibold p-4 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-semibold p-4 rounded-xl shadow-sm">
          {success}
        </div>
      )}

      {isVerifying ? (
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl">
          <HindiLoader title="Analyzing Speech Sample" />
        </div>
      ) : activeSection === 'check' ? (
        /* Checking section */
        <form onSubmit={handleVerifySubmit} className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">
              Who does this voice claim to be?
            </label>
            <select
              className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none transition text-brand-800"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">🔎 Auto detect closest speaker voiceprint</option>
              {members.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.relationship})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-50 p-5 rounded-2xl border border-brand-200">
            {/* Record column */}
            <div className="bg-white p-5 rounded-xl border border-brand-200 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h4 className="font-bold text-brand-800 text-sm mb-1">Record Audio Stream</h4>
                <p className="text-brand-500 text-xs">Speak into your system mic.</p>
              </div>
              
              {!recording ? (
                <button
                  type="button"
                  onClick={() => startRecording('verify')}
                  className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm min-h-[44px]"
                >
                  🎙️ Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition animate-pulse min-h-[44px]"
                >
                  ⏹ Stop ({recordingSeconds}s)
                </button>
              )}
            </div>

            {/* Upload column */}
            <div className="bg-white p-5 rounded-xl border border-brand-200 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h4 className="font-bold text-brand-800 text-sm mb-1">Upload File</h4>
                <p className="text-brand-500 text-xs">Supported: WAV, MP3, M4A, FLAC, OGG, OPUS, AAC, MP4, 3GP, AMR, WMA (including WhatsApp, Instagram, and Call recordings).</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, 'verify')}
                className="w-full text-xs text-brand-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200"
              />
            </div>
          </div>

          {verifyUrl && (
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-brand-500 block">Preview Sample:</span>
              <audio key={verifyUrl} src={verifyUrl} controls className="w-full" />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-accent-amber hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md shadow-accent-amber/10 min-h-[44px]"
          >
            🔍 Run Forensic Verification
          </button>
        </form>
      ) : (
        /* Enrollment section */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Enroll Form */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-brand-800 border-b border-brand-200 pb-2">
              Add New Speaker Signature
            </h3>
            
            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Speaker Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition text-brand-850"
                  placeholder="e.g. Grandma, Arthur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Relationship</label>
                <input
                  type="text"
                  required
                  className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-brand-400 transition text-brand-850"
                  placeholder="e.g. Grandmother, Associate"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>

              <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 space-y-3">
                <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider">
                  Voice Signature (10-20 seconds)
                </label>
                <p className="text-[10px] text-brand-500 leading-relaxed italic">
                  This is the step other tools skip. Without it, we can only guess if a voice is fake — with it, we can tell you if it's actually your family.
                </p>

                <div className="flex gap-2">
                  {!recording ? (
                    <button
                      type="button"
                      onClick={() => startRecording('enroll')}
                      className="flex-1 bg-accent-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition shadow-sm min-h-[44px]"
                    >
                      🎙️ Record sample
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex-1 bg-accent-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition animate-pulse min-h-[44px]"
                    >
                      ⏹ Stop ({recordingSeconds}s)
                    </button>
                  )}
                </div>

                <div className="text-center text-xs text-brand-400">OR</div>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'enroll')}
                  className="w-full text-xs text-brand-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200"
                />

                {enrollUrl && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-brand-500 block mb-1">Preview:</span>
                    <audio key={enrollUrl} src={enrollUrl} controls className="w-full" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isEnrolling}
                className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-md shadow-accent-teal/10 min-h-[44px]"
              >
                {isEnrolling ? 'Generating Biometric Voiceprint...' : 'Enroll Speaker'}
              </button>
            </form>
          </div>

          {/* List Column */}
          <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-brand-800 border-b border-brand-200 pb-2 flex justify-between items-center">
              Enrolled Speakers
              <span className="bg-brand-100 text-brand-700 text-xs px-2.5 py-1 rounded-full font-bold">
                {members.length} Enrolled
              </span>
            </h3>

            {members.length === 0 ? (
              <div className="text-center py-12 text-brand-500">
                <span className="text-3xl block mb-2">👥</span>
                <p className="text-sm font-semibold">No speakers enrolled yet.</p>
                <p className="text-xs mt-1">Enroll voice signatures to check incoming clips against verified identity profiles.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-100 max-h-[400px] overflow-y-auto pr-1">
                {members.map(member => (
                  <div key={member._id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-brand-850 text-base leading-snug">{member.name}</h4>
                        <p className="text-xs text-brand-500">Relation: {member.relationship}</p>
                      </div>
                      <button
                        onClick={() => handleMemberDelete(member._id)}
                        className="text-accent-red hover:bg-accent-red/10 border border-accent-red/20 px-2.5 py-1 rounded-lg text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                    <audio key={member.audioPath} src={member.audioBase64 || `${SERVER_URL}/${member.audioPath}`} controls className="w-full h-8" />
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
