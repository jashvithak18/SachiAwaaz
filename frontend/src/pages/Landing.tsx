import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function Landing() {
  const { setActiveTab } = useStore();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 }
      );
    }
  }, []);

  return (
    <div className="bg-brand-950 text-brand-100 min-h-screen font-sans selection:bg-accent-blue/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-accent-blue/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent-teal/5 blur-[120px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="border-b border-brand-850/50 backdrop-blur-md sticky top-0 z-50 bg-brand-950/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3.5">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider uppercase leading-none">AEGIS</h1>
              <span className="text-[9px] font-bold text-accent-blue tracking-widest uppercase mt-0.5 block">Trust Platform</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('auth_login')}
              className="text-sm font-semibold text-brand-300 hover:text-white transition px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="bg-white hover:bg-slate-200 text-brand-950 text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center space-x-2.5 bg-brand-900 border border-brand-800 px-4 py-1.5 rounded-full text-xs font-bold text-accent-blue mb-8 uppercase tracking-widest shadow-md"
        >
          <span>✨ Enterprise Security Core</span>
        </motion.div>
        
        <h2 
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 leading-none max-w-4xl mx-auto"
        >
          AI Digital Authenticity & <br/>
          <span className="bg-gradient-to-r from-accent-blue via-blue-400 to-accent-teal bg-clip-text text-transparent">
            Evidence Verification
          </span>
        </h2>
        
        <p className="text-brand-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          AEGIS protects organizational workflows against forged files, deepfake voice scams, and manipulated document evidence. Authentic forensic audits, engineered for critical trust.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => setActiveTab('auth_signup')}
            className="w-full sm:w-auto bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition duration-150 text-base shadow-lg shadow-accent-blue/20 min-h-[44px]"
          >
            Start Verifying Free
          </button>
          <a 
            href="#why-aegis"
            className="w-full sm:w-auto border border-brand-700 hover:bg-brand-800 text-brand-200 hover:text-white font-semibold py-3.5 px-8 rounded-xl transition text-base min-h-[44px] block"
          >
            Why Trust AEGIS?
          </a>
        </div>
      </section>

      {/* Core Mechanism / Differentiator (Problem) */}
      <section id="why-aegis" className="max-w-6xl mx-auto px-6 py-20 border-t border-brand-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-accent-teal uppercase tracking-widest block">The Cyber Challenge</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Generic detectors can only guess. AEGIS knows who the voice claims to be.
            </h3>
            <p className="text-brand-400 text-base leading-relaxed">
              Standard deepfake engines check if audio sounds synthetic, leaving a massive security vulnerability: realistic AI clones that match actual family or corporate personnel are missed. 
            </p>
            <p className="text-brand-400 text-base leading-relaxed">
              AEGIS introduces <strong>Personal Voiceprint Authentication</strong>. By enrolling secure speaker signatures, we match query clips directly against your family or executive profiles, identifying clones and impostors instantly.
            </p>
          </div>
          
          <div className="bg-brand-900 border border-brand-800 p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/10 rounded-full blur-xl"></div>
            <h4 className="font-extrabold text-white text-lg mb-4 flex items-center space-x-2">
              <span>🧬</span> <span>Unique Personal Enrollment</span>
            </h4>
            <div className="space-y-4">
              <div className="bg-brand-950 p-4 rounded-xl border border-brand-850 flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-400 font-bold uppercase">Enrolled Profile</p>
                  <p className="text-sm font-black text-white">Grandma (Grandmother)</p>
                </div>
                <span className="bg-accent-green/20 text-accent-green border border-accent-green/30 text-xs px-2.5 py-1 rounded-full font-bold">
                  Active Voiceprint
                </span>
              </div>
              <div className="bg-brand-950 p-4 rounded-xl border border-brand-850 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-400">Incoming Audio Sample Similarity:</span>
                  <span className="text-accent-red font-bold">57% (Mismatch)</span>
                </div>
                <div className="w-full bg-brand-900 rounded-full h-2">
                  <div className="bg-accent-red h-2 rounded-full" style={{ width: '57%' }}></div>
                </div>
                <p className="text-[11px] text-accent-red mt-1">
                  ⚠️ Critical Warning: The audio structure does not match Grandmother's voiceprint!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Type Engines */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-brand-900">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Multi-layered Defense</span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            One Unified Interface. Three Verification Engines.
          </h3>
          <p className="text-brand-400 text-base max-w-xl mx-auto mt-3">
            Secure your critical communication channels from multiple vectors of digital manipulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-accent-blue/30 transition duration-300 relative group cursor-pointer" onClick={() => setActiveTab('auth_signup')}>
            <div className="text-4xl mb-6 group-hover:scale-110 transition duration-300">🎙️</div>
            <h4 className="text-xl font-bold text-white mb-3">Voice Authentication</h4>
            <p className="text-brand-400 text-sm leading-relaxed mb-4">
              Scans query speech waves for generative AI model artifacts (e.g. ElevenLabs) and matches vocal signatures against enrolled family profiles.
            </p>
            <span className="text-xs font-semibold text-accent-blue group-hover:underline">Explore Engine &rarr;</span>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-accent-blue/30 transition duration-300 relative group cursor-pointer" onClick={() => setActiveTab('auth_signup')}>
            <div className="text-4xl mb-6 group-hover:scale-110 transition duration-300">🖼️</div>
            <h4 className="text-xl font-bold text-white mb-3">Image Forensics</h4>
            <p className="text-brand-400 text-sm leading-relaxed mb-4">
              Inspects graphic binaries for EXIF changes, compression artifacts, and digital manipulation footprints from AI rendering models.
            </p>
            <span className="text-xs font-semibold text-accent-blue group-hover:underline">Explore Engine &rarr;</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-accent-blue/30 transition duration-300 relative group cursor-pointer" onClick={() => setActiveTab('auth_signup')}>
            <div className="text-4xl mb-6 group-hover:scale-110 transition duration-300">📄</div>
            <h4 className="text-xl font-bold text-white mb-3">Document Integrity</h4>
            <p className="text-brand-400 text-sm leading-relaxed mb-4">
              Decodes structural compilation tags, checks OCR content consistency, detects digital signature blocks, and highlights potential contractual risks.
            </p>
            <span className="text-xs font-semibold text-accent-blue group-hover:underline">Explore Engine &rarr;</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-brand-900 to-slate-900 border-t border-b border-brand-850 py-20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
          <h3 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Protect your digital circle from simulated fraud.
          </h3>
          <p className="text-brand-400 text-lg max-w-xl mx-auto leading-relaxed">
            Get started with AEGIS today and secure your family and communications with robust, verifiable digital evidence logs.
          </p>
          <button 
            onClick={() => setActiveTab('auth_signup')}
            className="bg-white hover:bg-slate-200 text-brand-950 font-bold py-3.5 px-8 rounded-xl transition duration-150 text-base shadow-md min-h-[44px]"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-brand-500 text-sm">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold text-white tracking-widest uppercase">AEGIS</span>
        </div>
        <p>© 2026 AEGIS Security Trust Platform. Developed for HACKHAZARDS'26.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-brand-300 transition">Terms</a>
          <a href="#" className="hover:text-brand-300 transition">Privacy</a>
          <a href="#" className="hover:text-brand-300 transition">Status</a>
        </div>
      </footer>
    </div>
  );
}
