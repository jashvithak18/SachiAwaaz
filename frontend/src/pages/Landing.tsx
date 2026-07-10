import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Logo from '../components/Logo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Copy ─── */
const copy = {
  heroH1: "Some lies don't look like lies.",
  heroH2: "That's what makes them dangerous.",
  heroP1: "You receive something online.",
  heroP2: "You aren't sure if it's real.",
  heroP3: "PARAKH checks it in seconds.",
  heroP4: "Now you can decide with confidence.",
  heroP5: "Every day someone trusts a fake internship, an AI generated voice, an edited screenshot, or a forged document.",
  heroP6: "Not because they were careless.",
  heroP7: "Because everything looked real.",
  btnVerify: "Verify Something",
  btnStories: "See Real Stories",
  navVerify: "Verify Now",

  s1Bubble: '"Papa, I\'m in trouble. Send money."',
  s1Reveal: "It sounded exactly like her. The panic felt real.",
  s1Result: "🟢 Good catch. This voice appears AI-generated.",

  s2From: "hiring@goggle-careers.co",
  s2Subject: "Congratulations! You've been selected",
  s2Body1: "Dear Candidate,",
  s2Body2: "We are pleased to inform you that you have been selected for the Software Engineering Internship at our organization.",
  s2Body3: "Stipend: ₹45,000/month",
  s2Body4: "Please find the attached offer letter.",
  s2Attach: "Offer_Letter_2026.pdf",
  s2Flag1: "Wrong domain",
  s2Flag2: "Fake signature",
  s2Meta: "PDF created: 2 hours ago · Creator: Canva",
  s2Reveal: "You wanted to believe it. But something felt slightly off.",
  s2Result: "🟢 Good catch. This document contains forged details.",

  s3Name: "Uncle Sharma",
  s3Msg1: "Did you see this? Government just announced free laptop scheme for students!",
  s3Msg2: "Forward this to everyone. Last date tomorrow!",
  s3Sent: "Is this real?",
  s3Headline: "FREE LAPTOPS FOR ALL STUDENTS — Apply Now",
  s3Flag1: "Fake watermark",
  s3Flag2: "Edited header",
  s3Flag3: "No official source",
  s3Reveal: "It had government logos. Everyone was sharing it.",
  s3Result: "🟢 Good catch. This image has been manipulated.",

  s4Caption: "I invested just ₹500 and earned ₹5,00,000 in 3 months! Use this app now!",
  s4User: "@wealth_guru_official",
  s4Flag1: "Face manipulation detected",
  s4Flag2: "Voice pattern mismatch",
  s4Reveal: "It was a famous face you trusted. The advice felt authentic.",
  s4Result: "🟢 Good catch. This face/voice appears to be a deepfake.",

  interTitle: "What would you verify today?",
  interDrop: "Drop a file or click to upload",
  interAnalyze: "Looking for signs that something isn't right…",
  interDone: "Done. Here's what we found.",
  tabVoice: "Voice",
  tabDoc: "Document",
  tabImage: "Image",
  tabVideo: "Video",

  trustH: "Trust shouldn't be a gamble anymore.",
  trustP1: "We built PARAKH because everyone deserves to feel safe online.",
  trustLines: [
    "Every forwarded message,",
    "every unknown call,",
    "every edited document,",
    "every AI generated voice—",
  ],
  trustConclusion: "deserves verification before belief.",
  trustClose: "PARAKH exists to give people confidence before they trust.",

  ctaH1: "Don't verify because you're suspicious.",
  ctaH2: "Verify because the internet has changed.",
  ctaBtn: "Start Verifying",

  heroNews1: "₹1.4 crore lost to AI voice clone scam in Lucknow",
  heroNews1Src: "Times of India, 2024",
  heroNews2: "Fake job offer racket busted — 3,200 students duped",
  heroNews2Src: "NDTV, 2025",
  heroNews3: "Deepfake video of actress used to sell crypto",
  heroNews3Src: "India Today, 2024",
  heroNews4: "WhatsApp forwards caused mob violence in 6 states",
  heroNews4Src: "The Hindu, 2023",

  s1News: "Kerala: Man loses ₹40,000 after scammer clones son's voice using AI",
  s1NewsSrc: "Manorama Online, Jan 2025",
  s2News: "22-year-old arrested for creating 150+ fake Google, Microsoft offer letters",
  s2NewsSrc: "Economic Times, Mar 2025",
  s3News: "PIB fact-checks 1,800+ fake govt scheme images circulated on WhatsApp in 2024",
  s3NewsSrc: "Press Information Bureau, 2024",
  s4News: "Rashmika Mandanna deepfake video goes viral — Amitabh Bachchan, govt react",
  s4NewsSrc: "NDTV, Nov 2023",
};

const LOADING_LINES = [
  "हर आवाज़ सच नहीं होती",
  "हर दस्तावेज़ असली नहीं होता",
  "हर तस्वीर भरोसेमंद नहीं होती",
  "सत्य की जाँच की जा रही है…",
];

const INTERSTITIALS = [
  { icon: "💬", text: "Forwarded many times doesn't mean true." },
  { icon: "🛑", text: "Pause for five seconds." },
  { icon: "🤝", text: "Trust people. Verify files." },
  { icon: "🧠", text: "Doubt isn't disrespect." },
  { icon: "🔍", text: "The safest click is the informed one." },
];

/* ─── Dark green accent used throughout ─── */
const GREEN = '#2D5A3D';

/* ─── Fade-in wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Scrollytelling interstitial banner ─── */
function InterstitialMessage({ icon, text }: { icon: string; text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="relative z-10 py-10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#E4E1DA]/60 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative bg-[#F6F4EF] px-8 py-4 rounded-2xl flex items-center gap-3 border border-[#E4E1DA] shadow-md"
      >
        <span className="text-[20px] select-none">{icon}</span>
        <p className="text-[15px] font-bold tracking-tight italic" style={{ color: GREEN }}>"{text}"</p>
      </motion.div>
    </div>
  );
}

/* ─── Story reveal hook ─── */
function useStoryReveal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-140px' });
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (inView && !revealed) {
      const timer = setTimeout(() => setRevealed(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [inView, revealed]);
  return { ref, revealed, inView };
}

/* ─── Phone Frame ─── */
function PhoneFrame({ children, glitch = false }: { children: React.ReactNode; glitch?: boolean }) {
  return (
    <div className={`relative mx-auto w-[322px] rounded-[42px] bg-[#181818] p-[12px] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.18)] float-phone border border-white/5 ${glitch ? 'animate-[glitch_0.3s_ease-in-out_3]' : ''}`}>
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-[#181818] rounded-b-2xl z-10" />
      <div className="rounded-[32px] overflow-hidden bg-[#111]">{children}</div>
    </div>
  );
}

/* ─── Waveform bars ─── */
function WaveformBars({ error = false }: { error?: boolean }) {
  const heights = [12, 20, 8, 24, 14, 18, 10, 22, 16, 6, 20, 12, 18, 8, 14];
  return (
    <div className="flex items-end gap-[2px] h-[28px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full ${error ? 'bg-[#A1493F]' : 'bg-[#3E5C4B]'}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

/* ─── Result Badge ─── */
function ResultBadge({ text, visible }: { text: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-6 inline-flex items-center gap-3 border border-[#A1493F]/35 bg-[#A1493F]/5 px-5 py-3 rounded-2xl shadow-[0_12px_32px_rgba(161,73,63,0.12)]"
        >
          <span className="text-[14px] font-black text-[#A1493F] tracking-tight">{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Flag Label ─── */
function FlagLabel({ text, visible, delay = 0 }: { text: string; visible: boolean; delay?: number }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay }}
          className="inline-block text-[11px] font-black text-[#A1493F] bg-[#A1493F]/8 border border-[#A1493F]/20 px-3 py-1.5 rounded-xl shadow-sm"
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ─── Verify card with scroll entry ─── */
function VerifyCard({ icon, label, desc, delay }: { icon: string; label: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay }}
      className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-3xl p-6 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <span className="text-[32px] select-none">{icon}</span>
      <p className="text-[16px] font-extrabold text-[#181818] leading-snug">{label}</p>
      <p className="text-[13px] text-[#666] leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}

/* ─── Animated trust line that slides in ─── */
function TrustLine({ text, delay }: { text: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, x: -18 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay }}
      className="text-[22px] leading-snug font-medium"
      style={{ color: '#555' }}
    >
      {text}
    </motion.p>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { setActiveTab } = useStore();

  const [loading, setLoading] = useState(true);
  const [loadLineIdx, setLoadLineIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadLineIdx((prev) => {
        if (prev >= LOADING_LINES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 250);
          return prev;
        }
        return prev + 1;
      });
    }, 550);
    return () => clearInterval(interval);
  }, [loading]);

  const [showNav, setShowNav] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowNav(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const story1 = useStoryReveal();
  const story2 = useStoryReveal();
  const story3 = useStoryReveal();
  const story4 = useStoryReveal();

  const [activeTab, setTab] = useState('voice');
  const [demoState, setDemoState] = useState<'idle' | 'progress' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const startDemo = () => {
    if (demoState !== 'idle') return;
    setDemoState('progress');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setDemoState('done'), 300);
          return 100;
        }
        return p + 2;
      });
    }, 40);
  };

  const scrollToStories = () => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });

  const verifyCards = [
    { icon: '🎙️', label: 'Suspicious voice call', desc: 'An AI-cloned voice sounds exactly like someone you love. PARAKH spots the difference.' },
    { icon: '📄', label: 'Offer letter or certificate', desc: 'A forged document from a dream company. Signature looks real. Date looks off.' },
    { icon: '🖼️', label: 'Viral image or screenshot', desc: 'A government notice forwarded on WhatsApp. Logos, seals — but no official source.' },
    { icon: '🎬', label: 'Video of a public figure', desc: 'A famous face promoting something suspicious. Real voice or deepfake?' },
  ];

  /* trust section ref for stagger */
  const trustRef = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: '-80px' });

  return (
    <>
      {/* ─── LOADING SCREEN ─── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: '#F6F4EF' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-[200px]"
            >
              <Logo />
            </motion.div>
            <div className="mt-8 h-[24px] relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadLineIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-[15px] text-[#666] absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                >
                  {LOADING_LINES[loadLineIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="min-h-screen overflow-x-hidden antialiased relative"
        style={{ backgroundColor: '#F6F4EF', color: '#181818', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Background textures */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#181818 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
          <div className="absolute top-0 left-1/4 w-[80vw] h-[80vw] rounded-full blur-[120px] -translate-y-1/2" style={{ backgroundColor: 'rgba(45,90,61,0.025)' }} />
          <div className="absolute top-[40%] right-0 w-[60vw] h-[60vw] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(161,73,63,0.015)' }} />
          <div className="absolute bottom-[10%] left-10 w-[70vw] h-[70vw] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(45,90,61,0.02)' }} />
        </div>

        {/* Margin grid lines */}
        <div className="hidden lg:block fixed left-[5%] top-0 bottom-0 w-[1px] bg-[#E4E1DA]/45 z-0 pointer-events-none" />
        <div className="hidden lg:block fixed right-[5%] top-0 bottom-0 w-[1px] bg-[#E4E1DA]/45 z-0 pointer-events-none" />

        {/* ─── FIXED NAV ─── */}
        <AnimatePresence>
          {showNav && (
            <motion.header
              initial={{ y: -72, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -72, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b"
              style={{ backgroundColor: 'rgba(246,244,239,0.88)', borderColor: '#E4E1DA' }}
            >
              <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
                <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Logo className="w-36 h-auto" showTagline={true} />
                </div>
                <button
                  onClick={() => setActiveTab('auth_signup')}
                  className="text-[13px] font-bold text-white px-6 py-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ backgroundColor: '#181818' }}
                >
                  {copy.navVerify}
                </button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ─── HERO ─── */}
        <section className="relative z-10 min-h-screen flex flex-col">
          <div className="max-w-[1200px] w-full mx-auto px-6 pt-10 flex items-center justify-between h-[72px]">
            <Logo className="w-36 h-auto" showTagline={true} />
            <button
              onClick={() => setActiveTab('auth_signup')}
              className="text-[13px] font-bold text-white px-6 py-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: '#181818' }}
            >
              {copy.navVerify}
            </button>
          </div>

          <div className="flex-1 flex items-center">
            <div className="max-w-[1200px] w-full mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
              {/* Left text */}
              <div className="relative">
                <svg className="absolute -left-12 -top-16 w-[380px] h-[380px] text-[#E4E1DA]/45 pointer-events-none -z-10 select-none animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="42" />
                  <polygon points="50,15 53,30 68,30 56,40 60,55 50,45 40,55 44,40 32,30 47,30" />
                  <circle cx="50" cy="50" r="10" />
                </svg>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="font-extrabold tracking-tight leading-[1.05] text-[#181818]"
                  style={{ fontSize: 'clamp(44px, 6vw, 82px)' }}
                >
                  {copy.heroH1}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.25 }}
                  className="mt-5 text-[#666] font-normal"
                  style={{ fontSize: 'clamp(22px, 2.5vw, 34px)' }}
                >
                  {copy.heroH2}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="mt-8 max-w-[480px] text-[#666] leading-relaxed text-[16px] space-y-4"
                >
                  <div className="space-y-2 bg-white/40 backdrop-blur-sm border border-[#E4E1DA] p-5 rounded-2xl shadow-sm">
                    <p className="flex items-center gap-2.5 font-bold text-[#181818]"><span className="text-sm">📩</span><span>{copy.heroP1}</span></p>
                    <p className="flex items-center gap-2.5 font-bold text-[#181818]"><span className="text-[#A1493F] text-sm">❓</span><span>{copy.heroP2}</span></p>
                    <p className="flex items-center gap-2.5 font-bold text-[#181818]"><span className="text-sm">🔍</span><span>{copy.heroP3}</span></p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: GREEN }}><span className="text-sm">🟢</span><span>{copy.heroP4}</span></p>
                  </div>
                  <p className="text-[14px] leading-relaxed mt-2">{copy.heroP5}</p>
                  <p className="text-[#181818] font-extrabold">{copy.heroP6} {copy.heroP7}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="mt-8 flex items-center gap-6"
                >
                  <button
                    onClick={() => setActiveTab('auth_signup')}
                    className="text-[15px] font-bold text-white px-8 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: '#181818' }}
                  >
                    {copy.btnVerify}
                  </button>
                  <button
                    onClick={scrollToStories}
                    className="text-[15px] text-[#666] hover:text-[#181818] transition-colors font-bold"
                  >
                    ↓ {copy.btnStories}
                  </button>
                </motion.div>

                {/* Mobile news */}
                <div className="block md:hidden mt-10 space-y-4 pt-6 border-t border-[#E4E1DA]">
                  <p className="text-[11px] font-extrabold text-[#A1493F] uppercase tracking-wider mb-2">Real Incidents</p>
                  {[
                    { text: copy.heroNews1, src: copy.heroNews1Src },
                    { text: copy.heroNews2, src: copy.heroNews2Src },
                    { text: copy.heroNews3, src: copy.heroNews3Src },
                    { text: copy.heroNews4, src: copy.heroNews4Src },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-2xl p-5 text-left shadow-sm">
                      <p className="text-[13px] font-bold text-[#181818] leading-snug">{item.text}</p>
                      <p className="text-[10px] text-[#666] mt-2 flex items-center gap-1 font-semibold"><span>📰</span><span>{item.src}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right news cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={!loading ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="space-y-4 hidden md:block"
              >
                {[
                  { text: copy.heroNews1, src: copy.heroNews1Src, rotate: '-1deg' },
                  { text: copy.heroNews2, src: copy.heroNews2Src, rotate: '0.5deg' },
                  { text: copy.heroNews3, src: copy.heroNews3Src, rotate: '-0.3deg' },
                  { text: copy.heroNews4, src: copy.heroNews4Src, rotate: '0.8deg' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={!loading ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
                    className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    style={{ transform: `rotate(${item.rotate})` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#A1493F] mt-2 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-[14px] font-bold text-[#181818] leading-snug">{item.text}</p>
                        <p className="text-[11px] text-[#666] mt-2 flex items-center gap-1 font-bold"><span>📰</span><span>{item.src}</span></p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <p className="text-[11px] text-[#666]/40 text-center mt-2 italic font-medium">These are real incidents.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIAL 1 ── */}
        <InterstitialMessage icon={INTERSTITIALS[0].icon} text={INTERSTITIALS[0].text} />

        {/* ════ STORY 1 — Voice Clone ════ */}
        <section id="stories" className="relative z-10 py-20 flex items-center justify-center" ref={story1.ref}>
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col items-center">
              <PhoneFrame glitch={story1.revealed}>
                <div className="h-[552px] flex flex-col items-center justify-between py-12" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
                  <div className="text-center">
                    <div className="w-[72px] h-[72px] rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <span className="text-[28px] font-bold text-white/80">D</span>
                    </div>
                    <p className="text-white text-[28px] font-semibold">Dad</p>
                    <p className="text-white/50 text-[13px] mt-1">Incoming call...</p>
                  </div>
                  <div className="flex items-center gap-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-[56px] h-[56px] rounded-full bg-[#A1493F] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </div>
                      <span className="text-white/50 text-[11px]">Decline</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center" style={{ backgroundColor: GREEN }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </div>
                      <span className="text-white/50 text-[11px]">Accept</span>
                    </div>
                  </div>
                </div>
              </PhoneFrame>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={story1.inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-center"
              >
                <div className="inline-block bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-2xl px-5 py-3 text-[15px] text-[#181818] italic shadow-sm">
                  {copy.s1Bubble}
                </div>
              </motion.div>
            </div>

            <div className="max-w-[480px]">
              <Reveal>
                <AnimatePresence>
                  {story1.revealed && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5">
                      <p className="text-[28px] font-extrabold leading-tight text-[#181818]">{copy.s1Reveal}</p>
                      <div className="flex items-center gap-4">
                        <WaveformBars error />
                        <span className="text-[13px] text-[#666] font-mono font-bold">0:18</span>
                      </div>
                      <ResultBadge text={copy.s1Result} visible />
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-3xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <p className="text-[10px] font-bold text-[#A1493F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><span>📰</span><span>Real Incident</span></p>
                        <p className="text-[14px] font-bold text-[#181818] leading-relaxed">{copy.s1News}</p>
                        <p className="text-[11px] text-[#666] mt-2 flex items-center gap-1 font-bold"><span>📰</span><span>{copy.s1NewsSrc}</span></p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!story1.revealed && story1.inView && (
                  <div className="flex items-center gap-3 text-[#666] text-[14px] font-bold">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GREEN }} />
                    Scroll to reveal...
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIAL 2 ── */}
        <InterstitialMessage icon={INTERSTITIALS[1].icon} text={INTERSTITIALS[1].text} />

        {/* ════ STORY 2 — Fake Document ════ */}
        <section className="relative z-10 py-20 flex items-center justify-center" ref={story2.ref}>
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-[480px]">
              <Reveal>
                <AnimatePresence>
                  {story2.revealed && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                      <p className="text-[28px] font-extrabold leading-tight text-[#181818]">{copy.s2Reveal}</p>
                      <ResultBadge text={copy.s2Result} visible={story2.revealed} />
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-3xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <p className="text-[10px] font-bold text-[#A1493F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><span>📰</span><span>Real Incident</span></p>
                        <p className="text-[14px] font-bold text-[#181818] leading-relaxed">{copy.s2News}</p>
                        <p className="text-[11px] text-[#666] mt-2 flex items-center gap-1 font-bold"><span>📰</span><span>{copy.s2NewsSrc}</span></p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!story2.revealed && story2.inView && (
                  <div className="flex items-center gap-3 text-[#666] text-[14px] font-bold">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GREEN }} />
                    Scroll to reveal...
                  </div>
                )}
              </Reveal>
            </div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-[520px] bg-white rounded-2xl border-2 border-[#E4E1DA] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#E4E1DA] bg-[#FBFAF8]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A1493F]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C4A24E]/60" />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${GREEN}99` }} />
                  <span className="ml-3 text-[12px] text-[#666] font-bold">Mail</span>
                </div>
                <div className="px-6 py-4 border-b border-[#E4E1DA]/60">
                  <p className="text-[13px] text-[#666]">
                    From: <span className={`font-bold ${story2.revealed ? 'text-[#A1493F] underline decoration-wavy decoration-[#A1493F]/50' : 'text-[#181818]'}`}>{copy.s2From}</span>
                    {story2.revealed && <FlagLabel text={copy.s2Flag1} visible delay={0.2} />}
                  </p>
                  <p className="text-[15px] font-bold text-[#181818] mt-1">{copy.s2Subject}</p>
                </div>
                <div className="px-6 py-5 space-y-4 text-[14px] text-[#181818] leading-relaxed">
                  <p>{copy.s2Body1}</p>
                  <p className="text-[#666]">{copy.s2Body2}</p>
                  <p className="font-extrabold">{copy.s2Body3}</p>
                  <p className="text-[#666]">{copy.s2Body4}</p>
                  <div className="flex items-center gap-3 mt-4 p-3 bg-[#F6F4EF] rounded-xl border border-[#E4E1DA]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="text-[13px] text-[#666] font-bold">{copy.s2Attach}</span>
                  </div>
                  <div className={`mt-4 pt-4 border-t border-[#E4E1DA]/60 ${story2.revealed ? 'bg-[#A1493F]/5 -mx-6 px-6 py-4 border border-[#A1493F]/20 rounded-xl relative' : ''}`}>
                    <p className="text-[13px] text-[#666]">Best regards,</p>
                    <p className="text-[14px] font-bold text-[#181818] italic mt-1">Ravi Mehta</p>
                    <p className="text-[12px] text-[#666] font-medium">Talent Acquisition Lead</p>
                    {story2.revealed && <div className="absolute top-2 right-3"><FlagLabel text={copy.s2Flag2} visible delay={0.4} /></div>}
                  </div>
                </div>
                <AnimatePresence>
                  {story2.revealed && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }} className="px-6 py-3.5 bg-[#A1493F]/5 border-t border-[#A1493F]/20 text-[12px] text-[#A1493F] font-bold">
                      {copy.s2Meta}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIAL 3 ── */}
        <InterstitialMessage icon={INTERSTITIALS[2].icon} text={INTERSTITIALS[2].text} />

        {/* ════ STORY 3 — WhatsApp Image ════ */}
        <section className="relative z-10 py-20 flex items-center justify-center" ref={story3.ref}>
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[390px] rounded-2xl overflow-hidden border-2 border-[#E4E1DA] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3 px-4 py-3.5" style={{ backgroundColor: '#1F4539' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  <div className="w-[32px] h-[32px] rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-[13px] font-bold">S</span>
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-bold">{copy.s3Name}</p>
                    <p className="text-white/60 text-[11px] font-medium">online</p>
                  </div>
                </div>
                <div className="p-4 space-y-3" style={{ backgroundColor: '#ECE5DD' }}>
                  <div className="max-w-[85%]">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2 text-[13px] text-[#181818] shadow-sm">{copy.s3Msg1}</div>
                  </div>
                  <div className="max-w-[85%] relative">
                    <div className={`bg-white rounded-xl rounded-tl-sm overflow-hidden shadow-sm relative ${story3.revealed ? 'ring-2 ring-[#A1493F]/40' : ''}`}>
                      <div className="bg-[#1a3a5c] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-[20px] h-[20px] rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/80 font-bold">GOVT. NEWS</span>
                        </div>
                      </div>
                      <div className="px-3 py-3 bg-white">
                        <p className="text-[12px] font-bold text-[#181818] leading-tight">{copy.s3Headline}</p>
                        <p className="text-[10px] text-[#666] mt-1 font-bold">governmentnews.co.in</p>
                      </div>
                      {story3.revealed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(161,73,63,0.08) 4px, rgba(161,73,63,0.08) 5px)' }} />
                      )}
                    </div>
                    {story3.revealed && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <FlagLabel text={copy.s3Flag1} visible delay={0.1} />
                        <FlagLabel text={copy.s3Flag2} visible delay={0.25} />
                        <FlagLabel text={copy.s3Flag3} visible delay={0.4} />
                      </div>
                    )}
                  </div>
                  <div className="max-w-[85%]">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2 text-[13px] text-[#181818] shadow-sm">{copy.s3Msg2}</div>
                  </div>
                  <div className="max-w-[75%] ml-auto">
                    <div className="rounded-xl rounded-tr-sm px-3.5 py-2 text-[13px] text-[#181818] shadow-sm" style={{ backgroundColor: '#DCF8C6' }}>{copy.s3Sent}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-[480px]">
              <Reveal>
                <AnimatePresence>
                  {story3.revealed && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                      <p className="text-[28px] font-extrabold leading-tight text-[#181818]">{copy.s3Reveal}</p>
                      <ResultBadge text={copy.s3Result} visible={story3.revealed} />
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-3xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <p className="text-[10px] font-bold text-[#A1493F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><span>📰</span><span>Real Incident</span></p>
                        <p className="text-[14px] font-bold text-[#181818] leading-relaxed">{copy.s3News}</p>
                        <p className="text-[11px] text-[#666] mt-2 flex items-center gap-1 font-bold"><span>📰</span><span>{copy.s3NewsSrc}</span></p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!story3.revealed && story3.inView && (
                  <div className="flex items-center gap-3 text-[#666] text-[14px] font-bold">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GREEN }} />
                    Scroll to reveal...
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIAL 4 ── */}
        <InterstitialMessage icon={INTERSTITIALS[3].icon} text={INTERSTITIALS[3].text} />

        {/* ════ STORY 4 — Deepfake Reel ════ */}
        <section className="relative z-10 py-20 flex items-center justify-center" ref={story4.ref}>
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-[480px]">
              <Reveal>
                <AnimatePresence>
                  {story4.revealed && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                      <p className="text-[28px] font-extrabold leading-tight text-[#181818]">{copy.s4Reveal}</p>
                      <div className="flex flex-wrap gap-2">
                        <FlagLabel text={copy.s4Flag1} visible delay={0.1} />
                        <FlagLabel text={copy.s4Flag2} visible delay={0.25} />
                      </div>
                      <ResultBadge text={copy.s4Result} visible />
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-3xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <p className="text-[10px] font-bold text-[#A1493F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><span>📰</span><span>Real Incident</span></p>
                        <p className="text-[14px] font-bold text-[#181818] leading-relaxed">{copy.s4News}</p>
                        <p className="text-[11px] text-[#666] mt-2 flex items-center gap-1 font-bold"><span>📰</span><span>{copy.s4NewsSrc}</span></p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!story4.revealed && story4.inView && (
                  <div className="flex items-center gap-3 text-[#666] text-[14px] font-bold">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GREEN }} />
                    Scroll to reveal...
                  </div>
                )}
              </Reveal>
            </div>

            <div className="flex flex-col items-center">
              <PhoneFrame glitch={story4.revealed}>
                <div className="h-[552px] relative flex flex-col justify-end" style={{ backgroundColor: '#111' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[100px] h-[100px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  </div>
                  <div className="absolute right-3 bottom-[120px] flex flex-col items-center gap-5 z-20">
                    <div className="flex flex-col items-center gap-1">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      <span className="text-white text-[10px] font-bold">4.2L</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span className="text-white text-[10px] font-bold">892</span>
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </div>
                  <div className="p-4 pb-6 relative z-10" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <p className="text-white font-extrabold text-[13px] mb-1">{copy.s4User}</p>
                    <p className="text-white/80 text-[12px] leading-relaxed">{copy.s4Caption}</p>
                  </div>
                  {story4.revealed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute inset-0 pointer-events-none z-20" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(161,73,63,0.1) 3px, rgba(161,73,63,0.1) 4px)' }} />
                  )}
                </div>
              </PhoneFrame>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIAL 5 ── */}
        <InterstitialMessage icon={INTERSTITIALS[4].icon} text={INTERSTITIALS[4].text} />

        {/* ════ INTERACTIVE — What would you verify today? ════ */}
        <section className="relative z-10 py-24">
          <div className="max-w-[960px] mx-auto px-6">
            <Reveal>
              <h2 className="text-center font-bold tracking-tight text-[#181818] mb-3" style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}>
                {copy.interTitle}
              </h2>
              <p className="text-center text-[#666] text-[16px] font-medium mb-12 max-w-[520px] mx-auto leading-relaxed">
                Every day, people encounter something online that doesn't feel quite right. These are the moments PARAKH was built for.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
              {verifyCards.map((card, i) => (
                <VerifyCard key={i} icon={card.icon} label={card.label} desc={card.desc} delay={i * 0.1} />
              ))}
            </div>

            <Reveal delay={0.12}>
              <div className="flex justify-center gap-2 mb-8">
                {['voice', 'doc', 'image', 'video'].map((tab) => {
                  const labels: Record<string, string> = { voice: copy.tabVoice, doc: copy.tabDoc, image: copy.tabImage, video: copy.tabVideo };
                  return (
                    <button
                      key={tab}
                      onClick={() => { setTab(tab); setDemoState('idle'); setProgress(0); }}
                      className="px-5 py-3 rounded-xl text-[14px] font-bold transition-all"
                      style={{
                        backgroundColor: activeTab === tab ? '#181818' : 'transparent',
                        color: activeTab === tab ? '#fff' : '#666',
                        border: activeTab === tab ? 'none' : '2px solid #E4E1DA',
                      }}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
              <div className="bg-[#FBFAF8] border-2 border-[#E4E1DA] rounded-3xl p-8 shadow-[0_12px_32px_rgba(0,0,0,0.03)] max-w-[640px] mx-auto">
                {demoState === 'idle' && (
                  <div onClick={startDemo} className="border-2 border-dashed border-[#E4E1DA] hover:border-[#2D5A3D] rounded-2xl p-14 text-center cursor-pointer transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" className="mx-auto mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p className="text-[15px] text-[#666] font-bold">{copy.interDrop}</p>
                  </div>
                )}
                {demoState === 'progress' && (
                  <div className="py-8 text-center space-y-5">
                    <p className="text-[15px] text-[#666] font-bold">{copy.interAnalyze}</p>
                    <div className="w-full h-[4px] bg-[#E4E1DA] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: GREEN, width: `${progress}%` }} transition={{ ease: 'linear' }} />
                    </div>
                  </div>
                )}
                {demoState === 'done' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="py-8 text-center space-y-4">
                    <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center mx-auto border" style={{ backgroundColor: `${GREEN}1A`, borderColor: `${GREEN}33` }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[18px] font-extrabold" style={{ color: GREEN }}>{copy.interDone}</p>
                    <button onClick={() => setActiveTab('auth_signup')} className="text-[13px] text-[#666] hover:text-[#181818] underline underline-offset-4 transition-colors font-bold">
                      Sign up for full reports
                    </button>
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════ TRUST — Emotional staggered section ════ */}
        <section className="relative z-10 py-28 overflow-hidden" ref={trustRef}>
          {/* Soft full-width green ambient wash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={trustInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${GREEN}0D 0%, transparent 70%)` }}
          />

          <div className="max-w-[760px] mx-auto px-6">
            {/* Opening headline */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={trustInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-16"
            >
              <h2
                className="font-extrabold tracking-tight leading-tight"
                style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: GREEN }}
              >
                {copy.trustH}
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={trustInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-5 text-[18px] font-semibold text-[#181818] leading-relaxed"
              >
                {copy.trustP1}
              </motion.p>
            </motion.div>

            {/* Animated "every..." lines — stagger in from left */}
            <div className="space-y-4 mb-10 pl-2 border-l-4 ml-4" style={{ borderColor: `${GREEN}33` }}>
              {copy.trustLines.map((line, i) => (
                <TrustLine key={i} text={line} delay={i * 0.18} />
              ))}
            </div>

            {/* Conclusion line — bigger, bolder, centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={trustInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: copy.trustLines.length * 0.18 + 0.1 }}
              className="text-center my-10"
            >
              <p className="text-[26px] font-extrabold text-[#181818]">
                {copy.trustConclusion}
              </p>
            </motion.div>

            {/* Closing statement — green, centered, with a soft divider line above */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={trustInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: copy.trustLines.length * 0.18 + 0.4 }}
              className="relative text-center pt-10"
            >
              {/* Decorative mark */}
              <div className="w-12 h-[3px] rounded-full mx-auto mb-6" style={{ backgroundColor: `${GREEN}66` }} />
              <p
                className="text-[20px] font-extrabold leading-relaxed"
                style={{ color: GREEN }}
              >
                {copy.trustClose}
              </p>
              {/* Floating ambient orbs */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-8 top-0 w-[80px] h-[80px] rounded-full blur-2xl pointer-events-none"
                style={{ backgroundColor: `${GREEN}18` }}
              />
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -left-10 bottom-0 w-[60px] h-[60px] rounded-full blur-2xl pointer-events-none"
                style={{ backgroundColor: `${GREEN}12` }}
              />
            </motion.div>
          </div>
        </section>

        {/* ════ FINAL CTA ════ */}
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center py-20">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-extrabold tracking-tight text-[#181818] leading-[1.15]" style={{ fontSize: 'clamp(34px, 5vw, 60px)' }}>
                {copy.ctaH1}
              </h2>
              <p className="mt-5 text-[#666]" style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}>
                {copy.ctaH2}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <button
                onClick={() => setActiveTab('auth_signup')}
                className="mt-10 text-[16px] font-bold text-white px-9 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: '#181818' }}
              >
                {copy.ctaBtn}
              </button>
            </Reveal>
          </div>
        </section>

        {/* ════ FOOTER ════ */}
        <footer className="relative z-10 border-t border-[#E4E1DA]">
          <div className="max-w-[1200px] mx-auto px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              {/* Brand */}
              <div>
                <div className="max-w-[110px] mb-4">
                  <Logo showTagline={false} />
                </div>
                <p className="text-[13px] font-medium leading-relaxed max-w-[220px]" style={{ color: GREEN }}>
                  Digital verification for a world where everything looks real.
                </p>
              </div>

              {/* Verify */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: GREEN }}>
                  Verify
                </p>
                <ul className="space-y-2.5">
                  {['Voice & Audio', 'Documents & PDFs', 'Images & Screenshots', 'Websites & Links', 'QR Codes', 'Emails'].map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => setActiveTab('auth_signup')}
                        className="text-[13px] font-medium hover:underline underline-offset-4 transition-colors"
                        style={{ color: GREEN }}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust note */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: GREEN }}>
                  Why PARAKH
                </p>
                <p className="text-[13px] font-medium leading-relaxed" style={{ color: GREEN }}>
                  Built for people who want to be sure before they trust. Every verification is private, instant, and yours.
                </p>
                <button
                  onClick={() => setActiveTab('auth_signup')}
                  className="mt-5 inline-block text-[13px] font-extrabold px-5 py-2.5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                  style={{ color: GREEN, borderColor: `${GREEN}44`, backgroundColor: `${GREEN}08` }}
                >
                  Get started free →
                </button>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-[#E4E1DA] flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[12px] font-medium" style={{ color: `${GREEN}99` }}>
                © 2025 PARAKH. All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                {['Privacy', 'Terms', 'Contact'].map((link) => (
                  <button key={link} className="text-[12px] font-semibold transition-colors hover:underline underline-offset-4" style={{ color: GREEN }}>
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── KEYFRAMES ─── */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        .float-phone { animation: float 5s ease-in-out infinite; }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); opacity: 0.9; }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 2px); opacity: 0.95; }
        }
      `}</style>
    </>
  );
}
