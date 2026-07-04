import React, { useState, useEffect, useRef } from 'react';

export default function Enrollment({ token }) {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  
  // Audio state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMembers();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/family`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch family members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recording methods
  const startRecording = async () => {
    setError('');
    setSuccess('');
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
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 20) {
            // Auto stop at 20 seconds
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
    setSuccess('');
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
    setSuccess('');
    
    if (!name.trim() || !relationship.trim()) {
      setError('Please fill in both name and relationship fields.');
      return;
    }

    if (!audioBlob && !uploadedFile) {
      setError('Please record or upload a voice sample (10-20 seconds recommended).');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('relationship', relationship);
    
    if (audioBlob) {
      formData.append('audio', audioBlob, 'voice_sample.wav');
    } else {
      formData.append('audio', uploadedFile);
    }

    try {
      const response = await fetch(`${API_URL}/family`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll family member');
      }

      setSuccess(`Successfully enrolled ${name}!`);
      setName('');
      setRelationship('');
      setAudioBlob(null);
      setAudioUrl('');
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh list
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this family member? This will remove their voiceprint.')) {
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_URL}/family/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete');
      }

      setSuccess('Family member removed.');
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 py-6">
      {/* Onboarding Intro */}
      <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-900 mb-3">Onboarding & Enrollment</h2>
        <p className="text-brand-600 text-lg leading-relaxed">
          Generic tools can guess if a voice is AI-generated. SachiAwaaz checks it against your family's real voices. Enroll your family members to protect them. Register 2 to 5 trusted family members by naming them and securing a 10-20 second sample of their voice.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-accent-red p-4 rounded-xl text-accent-red text-base font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-accent-green p-4 rounded-xl text-accent-green text-base font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Column */}
        <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-brand-900 border-b border-brand-100 pb-3">
            Add New Family Member
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-700 mb-2">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-base min-h-[44px]"
                placeholder="e.g., Mom, Grandma, Arthur"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-700 mb-2">Relationship</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-brand-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-base min-h-[44px]"
                placeholder="e.g., Mother, Grandmother, Husband"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>

            {/* Audio Recording / Upload Section */}
            <div className="bg-brand-50 p-5 rounded-xl border border-brand-200 space-y-4">
              <label className="block text-base font-bold text-brand-800">
                Provide a Voice Sample (10-20 seconds)
              </label>
              <p className="text-brand-600 text-sm leading-relaxed italic">
                This is the step other tools skip. Without it, we can only guess if a voice is fake — with it, we can tell you if it's actually your family.
              </p>

              <div className="flex flex-wrap gap-3">
                {!recording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 text-base shadow-sm min-h-[44px]"
                  >
                    🎤 Record voice sample
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-150 text-base shadow-sm animate-pulse min-h-[44px]"
                  >
                    ⏹ Stop ({recordingSeconds}s / 20s)
                  </button>
                )}
              </div>

              <div className="relative flex items-center justify-center">
                <span className="text-brand-500 text-sm font-medium">OR</span>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/wav, audio/mp3, audio/m4a, audio/flac"
                  onChange={handleFileUpload}
                  className="w-full text-brand-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-brand-200 file:text-brand-800 hover:file:bg-brand-300"
                />
              </div>

              {audioUrl && (
                <div className="pt-2 space-y-2">
                  <span className="text-sm font-bold text-brand-700 block">Voice Sample Preview:</span>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-teal hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 text-base shadow-sm min-h-[44px]"
            >
              {submitting ? 'Creating voiceprint (loading models)...' : 'Enroll & Save Voiceprint'}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-brand-900 border-b border-brand-100 pb-3 flex justify-between items-center">
            Enrolled Family Members
            <span className="bg-brand-200 text-brand-800 text-xs px-2.5 py-1 rounded-full font-bold">
              {members.length} Enrolled
            </span>
          </h3>

          {loading ? (
            <p className="text-brand-500 py-6 text-center text-base">Loading family list...</p>
          ) : members.length === 0 ? (
            <div className="text-center py-10 text-brand-500">
              <span className="text-4xl block mb-2">👥</span>
              <p className="text-base">No family members enrolled yet.</p>
              <p className="text-sm mt-1">Enroll your loved ones to verify their clips.</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-100 max-h-[500px] overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member._id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-brand-900">{member.name}</h4>
                      <p className="text-sm text-brand-500 font-medium">
                        Relationship: {member.relationship}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="text-accent-red hover:bg-red-50 p-2 rounded-lg transition text-base font-semibold min-h-[44px]"
                      title="Delete member"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Embedded audio player */}
                  <div className="bg-brand-50 p-3 rounded-xl border border-brand-100">
                    <span className="text-xs font-bold text-brand-500 block mb-1">Enrolled Voiceprint:</span>
                    <audio 
                      src={`${SERVER_URL}/${member.audioPath}`} 
                      controls 
                      className="w-full h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
