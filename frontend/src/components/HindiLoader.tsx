import React, { useState, useEffect } from 'react';

const HINDI_PHRASES = [
  "सत्य की खोज जारी है...",
  "हर आवाज़ एक कहानी कहती है...",
  "प्रमाणों की परख हो रही है...",
  "सच्चाई सामने लाई जा रही है...",
  "विश्वास का निर्माण हो रहा है...",
  "डिजिटल साक्ष्यों का विश्लेषण जारी है..."
];

interface HindiLoaderProps {
  title?: string;
}

export default function HindiLoader({ title = "Forensic Audit In Progress" }: HindiLoaderProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HINDI_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
      
      {/* Morphing Gradient Loader */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-blue via-accent-amber to-accent-teal animate-spin blur-sm opacity-80"></div>
        <div className="absolute inset-2 bg-brand-50 rounded-full flex items-center justify-center border border-brand-200 shadow-inner">
          <svg className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#3E5C4B" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11L11 13L15 9" stroke="#FBFAF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-sans font-bold text-brand-800 text-lg uppercase tracking-wider">{title}</h4>
        <p className="font-devanagari text-lg text-accent-blue font-semibold animate-pulse">
          {HINDI_PHRASES[phraseIndex]}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex justify-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  );
}
