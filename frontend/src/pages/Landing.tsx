import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';

export default function Landing() {
  const { setActiveTab } = useStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax effect on Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroContainerRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / 25;
    const y = (clientY - innerHeight / 2) / 25;
    setMousePos({ x, y });
  };

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out', delay: 0.1 }
      );
    }
  }, []);

  // Scroll animations variables
  const { scrollYProgress } = useScroll();
  const problemY = useTransform(scrollYProgress, [0, 0.25], [100, 0]);
  const problemOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="bg-brand-100 text-brand-800 min-h-screen font-sans selection:bg-accent-blue/10 overflow-x-hidden relative"
      style={{ backgroundColor: '#FFF8F2' }}
    >
      {/* Decorative luxury gradient ambient spots */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent-blue/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] rounded-full bg-accent-amber/5 blur-[90px] pointer-events-none"></div>

      {/* Header / Glass Navbar */}
      <header className="border-b border-brand-200/50 backdrop-blur-md sticky top-0 z-50 bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-pulse">🛡️</span>
            <div>
              <h1 className="text-2xl font-black text-accent-blue tracking-wider leading-none">परख</h1>
              <span className="text-[10px] font-bold text-accent-amber tracking-widest uppercase mt-1 block">PARAKH Platform</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('auth_login')}
              className="text-sm font-semibold text-brand-500 hover:text-brand-800 transition px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-accent-blue/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroContainerRef}
        className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[85vh]"
      >
        {/* Left Headline */}
        <div className="space-y-8 text-left">
          <div className="inline-flex items-center space-x-2.5 bg-accent-blue/5 border border-accent-blue/10 px-4 py-1.5 rounded-full text-xs font-bold text-accent-blue uppercase tracking-widest shadow-sm">
            <span>✨ AI Evidence Forensic Platform</span>
          </div>

          <h2 
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-black font-devanagari text-brand-800 leading-tight tracking-tight"
          >
            हर डिजिटल प्रमाण की परख। <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-amber bg-clip-text text-transparent">
              हर सच की पुष्टि।
            </span>
          </h2>
          
          <p className="text-brand-500 text-base sm:text-lg leading-relaxed max-w-xl">
            PARAKH represents the state-of-the-art in digital trust. Authenticate voice, image, and document files using deep forensic AI, verifying claimed identities against enrolled signatures.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="w-full sm:w-auto bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition duration-150 text-sm shadow-lg shadow-accent-blue/15 min-h-[44px]"
            >
              Verify Evidence Now
            </button>
            <a 
              href="#problem"
              className="w-full sm:w-auto border border-brand-300 hover:bg-white text-brand-600 hover:text-brand-800 font-semibold py-3.5 px-8 rounded-xl transition text-sm text-center min-h-[44px] block"
            >
              Analyze Case Study
            </a>
          </div>
        </div>

        {/* Right Floating 3D-inspired Verification Dashboard */}
        <div className="relative h-[420px] w-full flex items-center justify-center pointer-events-none select-none">
          {/* Central Shield Glow */}
          <div 
            className="absolute w-36 h-36 rounded-full bg-accent-blue/10 blur-2xl transition duration-200"
            style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
          ></div>
          <div 
            className="absolute text-7xl z-20 animate-bounce"
            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
          >
            🛡️
          </div>

          {/* Voice card */}
          <div 
            className="absolute top-[10%] left-[5%] bg-white/90 border border-brand-200 p-4 rounded-2xl shadow-xl w-48 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px) rotate(-3deg)` }}
          >
            <p className="text-[10px] font-bold text-accent-blue uppercase">🎙️ Voice analysis</p>
            <p className="text-xs font-black text-brand-800 mt-1">Biometric Match</p>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-ping"></span>
              <span className="text-[10px] text-brand-500">98.4% Authentic</span>
            </div>
          </div>

          {/* Image card */}
          <div 
            className="absolute bottom-[15%] left-[10%] bg-white/90 border border-brand-200 p-4 rounded-2xl shadow-xl w-44 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * -0.8}px) rotate(4deg)` }}
          >
            <p className="text-[10px] font-bold text-accent-amber uppercase">🖼️ Image forensics</p>
            <p className="text-xs font-black text-accent-red mt-1">Edited (Canva)</p>
            <span className="text-[9px] bg-accent-red/10 text-accent-red px-2 py-0.5 rounded-full font-bold mt-2 inline-block">Altered</span>
          </div>

          {/* Document card */}
          <div 
            className="absolute top-[20%] right-[5%] bg-white/90 border border-brand-200 p-4 rounded-2xl shadow-xl w-48 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * 0.7}px) rotate(2deg)` }}
          >
            <p className="text-[10px] font-bold text-accent-teal uppercase">📄 Doc verification</p>
            <p className="text-xs font-black text-brand-800 mt-1">Cryptographic Check</p>
            <div className="w-full bg-brand-200 h-1.5 rounded-full mt-2">
              <div className="bg-accent-teal h-1.5 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>

          {/* Trust Score card */}
          <div 
            className="absolute bottom-[5%] right-[10%] bg-white/90 border border-brand-200 p-4 rounded-2xl shadow-xl w-40 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px) rotate(-5deg)` }}
          >
            <p className="text-[9px] font-bold text-brand-400 uppercase">Trust Score</p>
            <p className="text-2xl font-black text-accent-blue mt-1">94%</p>
          </div>
        </div>
      </section>

      {/* Section 1: The Problem (Scroll storytelling) */}
      <section id="problem" className="max-w-5xl mx-auto px-6 py-24 border-t border-brand-200/50">
        <motion.div 
          style={{ y: problemY, opacity: problemOpacity }}
          className="text-center space-y-8"
        >
          <span className="text-[10px] font-bold text-accent-red uppercase tracking-widest">A World Altered by AI</span>
          <h3 className="text-3xl sm:text-5xl font-black text-brand-850 leading-tight">
            "In the age of AI, <br />
            Seeing is no longer believing."
          </h3>
          <p className="text-brand-500 text-base max-w-xl mx-auto leading-relaxed">
            From cloned voice calls targeting grandparents to forged invoices and synthetic visual evidence, modern trust is breaking down. General classifiers only check if a file has digital anomalies. 
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left pt-6">
            <div className="bg-white/80 p-5 rounded-2xl border border-brand-200/70 shadow-sm space-y-2">
              <span className="text-2xl">🎙️</span>
              <h4 className="font-bold text-brand-800 text-sm">Fake Audio Notes</h4>
              <p className="text-brand-500 text-xs leading-normal">AI voice cloning software makes impersonating family or business partners trivial.</p>
            </div>
            <div className="bg-white/80 p-5 rounded-2xl border border-brand-200/70 shadow-sm space-y-2">
              <span className="text-2xl">🖼️</span>
              <h4 className="font-bold text-brand-800 text-sm">Synthetic Graphics</h4>
              <p className="text-brand-500 text-xs leading-normal">Generative engines compile highly realistic, counterfeit image evidence blocks.</p>
            </div>
            <div className="bg-white/80 p-5 rounded-2xl border border-brand-200/70 shadow-sm space-y-2">
              <span className="text-2xl">📄</span>
              <h4 className="font-bold text-brand-800 text-sm">Manipulated Documents</h4>
              <p className="text-brand-500 text-xs leading-normal">Altered textual details, metadata creation shifts, and missing contract signatures.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: Real World Statistics */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="bg-gradient-to-br from-accent-blue/5 to-accent-amber/5 p-8 rounded-3xl border border-brand-200 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <span className="text-4xl font-black text-accent-blue">₹128 Cr+</span>
            <p className="text-xs font-bold text-brand-650 uppercase">Scam Damage (2025)</p>
            <p className="text-[10px] text-brand-500">Losses incurred through digital voice cloning scams.</p>
          </div>
          <div className="space-y-2 border-y sm:border-y-0 sm:border-x border-brand-200 py-6 sm:py-0 sm:px-6">
            <span className="text-4xl font-black text-accent-blue">90%</span>
            <p className="text-xs font-bold text-brand-650 uppercase">Classification Rate</p>
            <p className="text-[10px] text-brand-500">Success percentage identifying forged document structures.</p>
          </div>
          <div className="space-y-2">
            <span className="text-4xl font-black text-accent-blue">15 Sec</span>
            <p className="text-xs font-bold text-brand-650 uppercase">Analysis Speed</p>
            <p className="text-[10px] text-brand-500">Average time to generate a forensic PDF audit ledger.</p>
          </div>
        </div>
      </section>

      {/* Section 3: How PARAKH Works */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-teal uppercase tracking-widest">Chronological Flow</span>
          <h3 className="text-3xl font-black text-brand-850 mt-2">The Verification Path</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <WorkflowStep number="1" title="Evidence Upload" desc="Drag & drop query voice clip, document structure, or graphic map." />
          <WorkflowStep number="2" title="Biometric Check" desc="Verify speaker waveforms against registered profiles." />
          <WorkflowStep number="3" title="AI Verification" desc="Check EXIF metadata records, compression artifacts, and OCR layers." />
          <WorkflowStep number="4" title="Forensic Report" desc="Download cryptographic verification summary ledger as PDF." />
        </div>
      </section>

      {/* Section 4: Supported Verifications */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Multi-Engine Capabilities</span>
          <h3 className="text-3xl font-black text-brand-850 mt-2">Three Core Security Pillars</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white hover:bg-brand-50/50 border border-brand-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 group cursor-pointer" onClick={() => setActiveTab('auth_signup')}>
            <span className="text-4xl block mb-6 animate-pulse">🎙️</span>
            <h4 className="text-lg font-black text-brand-800 mb-2">Voice authentication</h4>
            <p className="text-brand-500 text-xs leading-relaxed">Matches biometric vectors and pitch details against enrolled voiceprints to isolate clone scams.</p>
          </div>
          <div className="bg-white hover:bg-brand-50/50 border border-brand-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 group cursor-pointer" onClick={() => setActiveTab('auth_signup')}>
            <span className="text-4xl block mb-6 animate-pulse">🖼️</span>
            <h4 className="text-lg font-black text-brand-800 mb-2">Image forensics</h4>
            <p className="text-brand-500 text-xs leading-relaxed">Parses quantization, metadata software creation blocks, and digital tampering footprints.</p>
          </div>
          <div className="bg-white hover:bg-brand-50/50 border border-brand-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 group cursor-pointer" onClick={() => setActiveTab('auth_signup')}>
            <span className="text-4xl block mb-6 animate-pulse">📄</span>
            <h4 className="text-lg font-black text-brand-800 mb-2">Document verification</h4>
            <p className="text-brand-500 text-xs leading-relaxed">Audits PDF Creator strings, runs simulated OCR alignment reviews, and validates signature stamps.</p>
          </div>
        </div>
      </section>

      {/* Section 6: Interactive Demo Simulation */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-accent-amber uppercase tracking-widest">Interactive Sandbox</span>
            <h3 className="text-3xl font-black text-brand-850">
              Run a live simulation click.
            </h3>
            <p className="text-brand-500 text-sm leading-relaxed">
              Experience the core verification workflow. Try the interface sandbox directly. Enroll, scan, and inspect the trust score immediately.
            </p>
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition text-xs shadow-md min-h-[44px]"
            >
              Open Full Platform Workspace
            </button>
          </div>
          
          <div className="bg-white border border-brand-200 p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="font-bold text-brand-800 text-sm flex items-center space-x-2">
              <span>🔬</span> <span>Mock Analysis Sandbox</span>
            </h4>
            <div className="p-4 bg-brand-100 rounded-2xl border border-brand-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-brand-800">Voice Note Sample (Scam Alert)</span>
                <span className="text-accent-red font-black">FAIL</span>
              </div>
              <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                <div className="bg-accent-red h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-brand-500">
                <span>Trust Level: 42%</span>
                <span>AI Spoof: 94%</span>
              </div>
            </div>
            <div className="bg-brand-50 p-3.5 rounded-xl border border-brand-200 text-[10px] text-brand-600 leading-normal">
              <strong>Forensic Explanation:</strong> This voice matches the pitch pattern of Grandma, but demonstrates vocoder artifacts matching AI speech synthesis tools.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-accent-blue/10 to-accent-amber/5 border-t border-b border-brand-200/50 py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
          <h3 className="text-3xl sm:text-5xl font-black font-devanagari text-brand-850 leading-tight">
            सत्य की परख, सुरक्षा की गारंटी।
          </h3>
          <p className="text-brand-550 text-base max-w-xl mx-auto leading-relaxed">
            Ensure the validity of your communication channels, legal documents, and digital evidence logs. Register your corporate workspace with PARAKH today.
          </p>
          <button 
            onClick={() => setActiveTab('auth_signup')}
            className="bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition duration-150 text-xs shadow-md min-h-[44px]"
          >
            Create Your Investigation ID
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-brand-500 text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold text-accent-blue tracking-widest uppercase">परख (PARAKH)</span>
        </div>
        <p>© 2026 PARAKH Digital Trust Forensics. developed for HACKHAZARDS'26.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-brand-700 transition">Terms</a>
          <a href="#" className="hover:text-brand-700 transition">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

interface WorkflowStepProps {
  number: string;
  title: string;
  desc: string;
}

function WorkflowStep({ number, title, desc }: WorkflowStepProps) {
  return (
    <div className="bg-white border border-brand-200 p-5 rounded-2xl shadow-sm relative space-y-2">
      <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent-blue text-white font-black flex items-center justify-center text-xs shadow-md">
        {number}
      </span>
      <h4 className="font-bold text-brand-800 text-sm pt-2">{title}</h4>
      <p className="text-brand-550 text-[11px] leading-relaxed">{desc}</p>
    </div>
  );
}
