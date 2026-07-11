import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import Logo from '../components/Logo';

/* ─── Brand palette ─── */
const C = {
  bg:     '#F6F4EF',
  card:   '#FBFAF8',
  text:   '#132219',
  muted:  '#2C4235',
  subtle: '#476150',
  green:  '#3E5C4B',
  red:    '#A1493F',
  border: '#E4E1DA',
};

/* ─── Animated Background Component ─── */
function AnimatedBackground() {
  const particles = Array.from({ length: 15 });
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Soft mesh background gradient */}
      <div 
        className="absolute inset-0 opacity-40" 
        style={{
          backgroundImage: `
            radial-gradient(at 10% 10%, #EFECE5 0px, transparent 50%),
            radial-gradient(at 90% 10%, #F5F2EA 0px, transparent 50%),
            radial-gradient(at 50% 80%, #E9E6DC 0px, transparent 50%)
          `
        }}
      />
      {/* 3 Slowly drifting organic blobs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full blur-[110px] opacity-[0.045]"
        style={{ backgroundColor: '#3E5C4B' }}
      />
      <motion.div
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.04]"
        style={{ backgroundColor: '#A1493F' }}
      />
      <motion.div
        animate={{
          x: [0, 20, -40, 0],
          y: [0, 30, 30, 0],
          scale: [1, 1.05, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[40%] left-[30%] w-[350px] h-[350px] rounded-full blur-[100px] opacity-[0.035]"
        style={{ backgroundColor: '#CBD5E1' }}
      />
      {/* Floating particles */}
      {particles.map((_, i) => {
        const size = Math.random() * 5 + 3;
        const startX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 12 + 10;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: '#3E5C4B',
              left: `${startX}%`,
              bottom: '-5%',
              opacity: Math.random() * 0.08 + 0.03,
            }}
            animate={{
              y: ['-110%', '110%'],
              x: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'linear',
              delay,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Floating Verification Icons in Hero ─── */
function FloatingVerifyObjects({ cursor }: { cursor: { x: number; y: number } }) {
  const items = [
    { icon: '📄', label: 'Document', top: '15%', left: '44%', rotSpeed: 25, delay: 0 },
    { icon: '🎙️', label: 'Voice', top: '38%', left: '50%', rotSpeed: -30, delay: 1.5 },
    { icon: '🖼️', label: 'Image', top: '65%', left: '42%', rotSpeed: 35, delay: 0.8 },
    { icon: '🎥', label: 'Video', top: '22%', left: '60%', rotSpeed: -20, delay: 2.2 },
    { icon: '🔗', label: 'Link', top: '55%', left: '56%', rotSpeed: 28, delay: 1.1 }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block overflow-hidden">
      {items.map((item, i) => {
        // Dynamic shift based on cursor
        const offsetX = cursor.x !== -999 ? (cursor.x - window.innerWidth / 2) * 0.018 : 0;
        const offsetY = cursor.y !== -999 ? (cursor.y - window.innerHeight / 2) * 0.018 : 0;

        return (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center rounded-2xl border bg-white/40 backdrop-blur-sm shadow-sm select-none p-3 pointer-events-none"
            style={{
              top: item.top,
              left: item.left,
              borderColor: `${C.border}66`,
              width: '46px',
              height: '46px',
            }}
            animate={{
              y: [0, -10, 0],
              x: [0, Math.sin(i) * 5, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay
            }}
          >
            <motion.div
              style={{ x: offsetX, y: offsetY }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: Math.abs(item.rotSpeed), repeat: Infinity, ease: 'linear' }}
              className="text-lg opacity-45"
            >
              {item.icon}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Custom Analysis Simulator in Interactive Demo ─── */
function DemoAnalysisProgress({ activeTab, progress }: { activeTab: string; progress: number }) {
  return (
    <div className="py-6 text-center space-y-6 flex flex-col items-center justify-center">
      {/* Animated Feature Visualizer */}
      <div className="relative w-48 h-28 rounded-2xl border border-brand-200 bg-brand-50/50 flex items-center justify-center overflow-hidden shadow-inner animate-[softGlow_4s_infinite]" style={{ borderColor: C.border }}>
        {activeTab === 'voice' || activeTab === 'live' ? (
          <div className="flex items-end gap-1.5 h-12">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-accent-green"
                animate={{ height: [12, Math.random() * 40 + 8, 12] }}
                transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        ) : activeTab === 'doc' ? (
          <div className="relative w-16 h-20 bg-white rounded-md border shadow-sm flex flex-col gap-2 p-2.5" style={{ borderColor: C.border }}>
            <div className="w-full h-2 bg-brand-100 rounded-sm" />
            <div className="w-4/5 h-2 bg-brand-100 rounded-sm" />
            <div className="w-full h-2 bg-brand-100 rounded-sm" />
            {/* Laser beam */}
            <motion.div 
              className="absolute left-0 right-0 h-0.5 bg-accent-green shadow-[0_0_8px_#3E5C4B]"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        ) : (
          <div className="relative w-24 h-16 bg-white rounded-md border shadow-sm flex items-center justify-center" style={{ borderColor: C.border }}>
            <span className="text-2xl">🖼️</span>
            {/* Laser beam */}
            <motion.div 
              className="absolute left-0 right-0 h-0.5 bg-accent-red shadow-[0_0_8px_#A1493F]"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-[14px] font-bold tracking-tight" style={{ color: C.muted }}>
          {activeTab === 'voice' ? 'Analyzing voice frequency prints...' : 
           activeTab === 'doc' ? 'Verifying digital signatures & metadata...' : 
           activeTab === 'image' ? 'Running noise consistency analysis...' : 'Listening for audio stream anomalies...'}
        </p>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-brand-200" style={{ backgroundColor: C.border }}>
          <motion.div className="h-full rounded-full bg-accent-green" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

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

  // Story 4 — Voice phishing (replaces video)
  s4Caller: "SBI Bank — Fraud Dept.",
  s4Duration: "0:42",
  s4Transcript: '"This is an urgent alert. Suspicious activity has been detected on your account. Press 1 to speak with our fraud officer immediately."',
  s4Flag1: "Synthetic voice pattern",
  s4Flag2: "Unnatural cadence",
  s4Flag3: "Spoofed caller ID",
  s4Reveal: "It sounded official. Urgent. Like they'd really found fraud on your account.",
  s4Result: "🟢 Good catch. This voice is AI-generated — a vishing attack.",

  interTitle: "What would you verify today?",
  interDrop: "Drop a file or click to upload",
  interAnalyze: "Looking for signs that something isn't right…",
  interDone: "Done. Here's what we found.",
  tabVoice: "Voice",
  tabDoc: "Document",
  tabImage: "Image",
  tabLive: "Live Voice",

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
  heroNews3: "Deepfake audio of bank officer defrauds Delhi businessman",
  heroNews3Src: "India Today, 2024",
  heroNews4: "WhatsApp forwards caused mob violence in 6 states",
  heroNews4Src: "The Hindu, 2023",

  s1News: "Kerala: Man loses ₹40,000 after scammer clones son's voice using AI",
  s1NewsSrc: "Manorama Online, Jan 2025",
  s2News: "22-year-old arrested for creating 150+ fake Google, Microsoft offer letters",
  s2NewsSrc: "Economic Times, Mar 2025",
  s3News: "PIB fact-checks 1,800+ fake govt scheme images circulated on WhatsApp in 2024",
  s3NewsSrc: "Press Information Bureau, 2024",
  s4News: "Vishing attacks using AI-cloned bank officer voices surge 300% in India",
  s4NewsSrc: "Economic Times Cybersecurity, Mar 2025",
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

/* ════════════════════════════════════
   PARALLAX HOOK
   strength > 0 → element moves UP slower than scroll (floats)
   strength < 0 → element moves DOWN faster than scroll
   ════════════════════════════════════ */
function useParallax(strength: number = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${strength * -80}px`, `${strength * 80}px`]);
  return { ref, y };
}

/* ─── Generic scroll-reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Catchy, animated word reveal heading with slow float ─── */
function CatchyHeading({ text, delay = 0, className = '', style = {} }: {
  text: string; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const words = text.split(' ');

  return (
    <motion.h2
      ref={ref}
      className={`flex flex-wrap ${className}`}
      style={style}
      animate={inView ? { y: [0, -3, 0] } : {}}
      transition={{
        y: {
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 1.2,
        }
      }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em] pb-[0.05em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
              delay: delay + i * 0.08,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

/* ─── Interstitial banner ─── */
function InterstitialMessage({ icon, text }: { icon: string; text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="relative z-10 py-10 flex items-center justify-center overflow-hidden">
      {/* Animated growing horizontal line */}
      <motion.div 
        className="absolute inset-x-0 top-1/2 h-px pointer-events-none origin-center" 
        style={{ backgroundColor: C.border }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 14 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative px-8 py-4 rounded-2xl flex items-center gap-3 shadow-md border"
        style={{ backgroundColor: C.card, borderColor: C.border }}
      >
        <span className="text-[20px] select-none">{icon}</span>
        <p className="text-[15px] font-bold tracking-tight italic" style={{ color: C.green }}>"{text}"</p>
      </motion.div>
    </div>
  );
}

/* ─── Phone Frame ─── */
function PhoneFrame({ children, glitch = false }: { children: React.ReactNode; glitch?: boolean }) {
  return (
    <motion.div 
      className={`relative mx-auto w-[322px] rounded-[42px] bg-[#181818] p-[12px] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.18)] border border-white/5 ${glitch ? 'animate-[glitch_0.3s_ease-in-out_3]' : ''}`}
      animate={{
        y: [0, -6, 0],
        rotate: [0, 0.6, -0.6, 0]
      }}
      transition={{
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' }
      }}
      whileHover={{
        scale: 1.025,
        rotateX: 4,
        rotateY: -4,
        boxShadow: '0 45px 120px -20px rgba(0,0,0,0.3)',
      }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-[#181818] rounded-b-2xl z-10" />
      <div className="rounded-[32px] overflow-hidden bg-[#111]">{children}</div>
    </motion.div>
  );
}

/* ─── Waveform ─── */
function WaveformBars({ error = false, animated = false }: { error?: boolean; animated?: boolean }) {
  const heights = [8, 16, 6, 22, 12, 18, 8, 24, 14, 6, 20, 10, 18, 6, 14, 20, 8, 16, 10, 22];
  return (
    <div className="flex items-end gap-[2px] h-[28px]">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: error ? C.red : C.green }}
          animate={animated ? { height: [`${h}px`, `${Math.max(4, h * 0.4)}px`, `${h}px`] } : { height: `${h}px` }}
          transition={{ duration: 0.6 + i * 0.04, repeat: animated ? Infinity : 0, ease: 'easeInOut', delay: i * 0.03 }}
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
          className="mt-5 inline-flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-md"
          style={{ borderColor: `${C.red}55`, backgroundColor: `${C.red}0D` }}
        >
          <span className="text-[14px] font-black tracking-tight" style={{ color: C.red }}>{text}</span>
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
          className="inline-block text-[11px] font-black px-3 py-1.5 rounded-xl border"
          style={{ color: C.red, backgroundColor: `${C.red}0D`, borderColor: `${C.red}33` }}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ─── Verify card ─── */
function VerifyCard({ icon, label, desc, delay }: { icon: string; label: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay }}
      whileHover={{ y: -4, borderColor: C.green, boxShadow: '0 12px 30px -10px rgba(62,92,75,0.15)' }}
      className="rounded-3xl p-6 flex flex-col gap-3 border-2 transition-all duration-300 cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${C.card} 0%, #F5F2EA 100%)`, borderColor: C.border }}
    >
      <span className="text-[32px] select-none">{icon}</span>
      <p className="text-[16px] font-extrabold leading-snug" style={{ color: C.text }}>{label}</p>
      <p className="text-[13px] leading-relaxed font-medium" style={{ color: C.muted }}>{desc}</p>
    </motion.div>
  );
}

/* ─── Story text — per-element scroll triggers ─── */
function StoryText({ quote, badge, news, newsSrc, flags }: {
  quote: string; badge: string; news: string; newsSrc: string; flags?: string[];
}) {
  const quoteRef = useRef(null);
  const badgeRef = useRef(null);
  const newsRef  = useRef(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: '-60px' });
  const badgeInView = useInView(badgeRef, { once: true, margin: '-60px' });
  const newsInView  = useInView(newsRef,  { once: true, margin: '-60px' });
  return (
    <div className="max-w-[480px] space-y-6">
      <motion.p
        ref={quoteRef}
        initial={{ opacity: 0, y: 22 }}
        animate={quoteInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-[26px] font-extrabold leading-tight"
        style={{ color: C.text }}
      >
        {quote}
      </motion.p>
      <motion.div
        ref={badgeRef}
        initial={{ opacity: 0, y: 14 }}
        animate={badgeInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="space-y-3"
      >
        {flags && (
          <div className="flex flex-wrap gap-2">
            {flags.map((f, i) => <FlagLabel key={i} text={f} visible delay={i * 0.12} />)}
          </div>
        )}
        <ResultBadge text={badge} visible={badgeInView} />
      </motion.div>
      <motion.div
        ref={newsRef}
        initial={{ opacity: 0, y: 18 }}
        animate={newsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.12 }}
        whileHover={{ y: -4, borderColor: C.green, boxShadow: '0 12px 30px -10px rgba(62,92,75,0.15)' }}
        className="rounded-3xl p-6 border-2 shadow-md transition-all duration-300"
        style={{ background: `linear-gradient(135deg, ${C.card} 0%, #F5F2EA 100%)`, borderColor: C.border }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: C.red }}>
          <span>📰</span><span>Real Incident</span>
        </p>
        <p className="text-[14px] font-bold leading-relaxed" style={{ color: C.text }}>{news}</p>
        <p className="text-[11px] mt-2 flex items-center gap-1 font-bold" style={{ color: C.subtle }}>
          <span>📰</span><span>{newsSrc}</span>
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Newspaper clipping ─── */
function NewsClipping({ text, src, rotate, variant, idx }: {
  text: string; src: string; rotate: string;
  variant: 'broadsheet' | 'aged' | 'breaking' | 'digital'; idx: number;
}) {
  const bgMap = { broadsheet: '#FFFEF9', aged: '#FAF7EE', breaking: '#FFFCFA', digital: '#F8F9FF' };
  const rotNum = parseFloat(rotate) || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, rotate: rotNum }}
      animate={{ opacity: 1, y: 0, rotate: rotNum }}
      transition={{ duration: 0.65, delay: 0.45 + idx * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{
        y: -4,
        scale: 1.02,
        rotate: rotNum * 0.4,
        boxShadow: '0 20px 40px rgba(19, 34, 25, 0.12), 0 5px 15px rgba(0, 0, 0, 0.04)',
      }}
      className="relative shadow-md transition-shadow duration-300 cursor-default clipping-card origin-center"
      style={{ backgroundColor: bgMap[variant], borderRadius: '2px' }}
    >
      <div className="h-[3px] w-full" style={{ backgroundColor: variant === 'breaking' ? C.red : variant === 'digital' ? C.green : '#2A2A2A' }} />
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.18em]"
            style={{ color: variant === 'breaking' ? C.red : '#2A2A2A', fontFamily: 'Georgia, serif' }}>
            {variant === 'breaking' ? '⚡ Breaking' : variant === 'aged' ? 'Archive' : variant === 'digital' ? 'Online' : 'National'}
          </span>
          <span className="text-[9px]" style={{ color: C.subtle, fontFamily: 'Georgia, serif' }}>{src}</span>
        </div>
        <div className="w-full h-px mb-3" style={{ backgroundColor: '#2A2A2A33' }} />
        <p style={{ color: '#1A1A1A', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: variant === 'broadsheet' ? '14px' : '13px', fontWeight: 700, lineHeight: 1.4 }}>
          {text}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.red }} />
          <span className="text-[9px]" style={{ color: C.subtle, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Verified report</span>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-6 h-6"
        style={{ background: `linear-gradient(135deg, transparent 50%, ${variant === 'aged' ? '#E8E0C8' : '#E8E6E0'} 50%)` }} />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { setActiveTab, token } = useStore();

  /* Loading */
  const [loading, setLoading] = useState(true);
  const [loadLineIdx, setLoadLineIdx] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadLineIdx((prev) => {
        if (prev >= LOADING_LINES.length - 1) { clearInterval(interval); setTimeout(() => setLoading(false), 250); return prev; }
        return prev + 1;
      });
    }, 550);
    return () => clearInterval(interval);
  }, [loading]);

  /* Sticky nav */
  const [showNav, setShowNav] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowNav(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Cursor spotlight with active motion detection */
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const [isMoving, setIsMoving] = useState(false);
  const movingTimeout = useRef<any>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      if (movingTimeout.current) clearTimeout(movingTimeout.current);
      movingTimeout.current = setTimeout(() => {
        setIsMoving(false);
      }, 150);
    };
    window.addEventListener('mousemove', h);
    return () => {
      window.removeEventListener('mousemove', h);
      if (movingTimeout.current) clearTimeout(movingTimeout.current);
    };
  }, []);

  /* Verify button nudge */
  const [btnNudge, setBtnNudge] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setBtnNudge(true);
      setTimeout(() => setBtnNudge(false), 700);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  /* Background scroll colour shift */
  const [scrollFrac, setScrollFrac] = useState(0);
  useEffect(() => {
    const h = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setScrollFrac(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const bgColor = `rgb(${Math.round(246 + (241 - 246) * scrollFrac)},${Math.round(244 + (237 - 244) * scrollFrac)},${Math.round(239 + (230 - 239) * scrollFrac)})`;

  /* Global scroll Y for parallax */
  const { scrollY } = useScroll();

  /* Parallax for hero background orbs */
  const orb1Y = useTransform(scrollY, [0, 1500], [0, -120]);
  const orb2Y = useTransform(scrollY, [0, 1500], [0, -60]);
  const orb3Y = useTransform(scrollY, [0, 1500], [0, -80]);

  /* Parallax for hero text block */
  const heroTextY = useTransform(scrollY, [0, 600], [0, -40]);

  /* Parallax for hero news cards */
  const newsCardsY = useTransform(scrollY, [0, 600], [0, 30]);

  /* Story image parallax */
  const s1Para = useParallax(0.08);
  const s2Para = useParallax(0.06);
  const s3Para = useParallax(0.08);
  const s4Para = useParallax(0.07);

  /* Story image reveal state */
  const s1imgRef = useRef(null); const s2imgRef = useRef(null);
  const s3imgRef = useRef(null); const s4imgRef = useRef(null);
  const s1ImgView = useInView(s1imgRef, { once: true, margin: '-80px' });
  const s2ImgView = useInView(s2imgRef, { once: true, margin: '-80px' });
  const s3ImgView = useInView(s3imgRef, { once: true, margin: '-80px' });
  const s4ImgView = useInView(s4imgRef, { once: true, margin: '-80px' });
  const [s1glitch, setS1glitch] = useState(false);
  const [s4anim, setS4anim] = useState(false);
  useEffect(() => { if (s1ImgView) setTimeout(() => setS1glitch(true), 1200); }, [s1ImgView]);
  useEffect(() => { if (s4ImgView) setTimeout(() => setS4anim(true), 900); }, [s4ImgView]);

  /* Interactive demo */
  const [activeTab, setTab] = useState('voice');
  const [demoState, setDemoState] = useState<'idle' | 'progress' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const startDemo = () => {
    if (demoState !== 'idle') return;
    setDemoState('progress'); setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(interval); setTimeout(() => setDemoState('done'), 300); return 100; } return p + 2; });
    }, 40);
  };

  const scrollToStories = () => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });

  const verifyCards = [
    { icon: '🎙️', label: 'Suspicious voice call', desc: 'An AI-cloned voice sounds exactly like someone you love. PARAKH spots the difference.' },
    { icon: '📄', label: 'Offer letter or certificate', desc: 'A forged document from a dream company. Signature looks real. Date looks off.' },
    { icon: '🖼️', label: 'Viral image or screenshot', desc: 'A government notice forwarded on WhatsApp. Logos, seals — but no official source.' },
    { icon: '🔊', label: 'Voice note or audio clip', desc: 'An audio message from a number you don\'t recognise. Sounds urgent. Sounds real.' },
  ];

  /* Trust section — cinematic sequential reveal */
  const trustRef = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: '-100px' });
  const [trustStep, setTrustStep] = useState(-1);
  const lineStarted = useRef(false);
  useEffect(() => {
    if (!trustInView || lineStarted.current) return;
    lineStarted.current = true;
    [0, 600, 1300, 2000, 2700, 3400, 4300, 5100].forEach((d, i) => setTimeout(() => setTrustStep(i), d));
  }, [trustInView]);

  const [lineGrow, setLineGrow] = useState(false);
  useEffect(() => { if (trustInView) setTimeout(() => setLineGrow(true), 1200); }, [trustInView]);

  return (
    <>
      {/* Cursor spotlight */}
      <motion.div
        className="fixed pointer-events-none z-[200] rounded-full"
        animate={{
          width: isMoving ? 520 : 320,
          height: isMoving ? 520 : 320,
          x: cursor.x - (isMoving ? 260 : 160),
          y: cursor.y - (isMoving ? 260 : 160),
          background: isMoving
            ? 'radial-gradient(circle, rgba(62, 92, 75, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(62, 92, 75, 0.05) 0%, transparent 70%)',
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
      />

      {/* Loading screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: C.bg }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-w-[200px]">
              <Logo />
            </motion.div>
            <div className="mt-8 h-[24px] relative">
              <AnimatePresence mode="wait">
                <motion.p key={loadLineIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  className="text-[15px] absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ color: C.muted, fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                  {LOADING_LINES[loadLineIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden antialiased relative"
        style={{ backgroundColor: bgColor, color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Background textures */}
        <AnimatedBackground />

        {/* Margin guides */}
        <div className="hidden lg:block fixed left-[5%] top-0 bottom-0 w-[1px] pointer-events-none z-0" style={{ backgroundColor: `${C.border}60` }} />
        <div className="hidden lg:block fixed right-[5%] top-0 bottom-0 w-[1px] pointer-events-none z-0" style={{ backgroundColor: `${C.border}60` }} />

        {/* Sticky nav */}
        <AnimatePresence>
          {showNav && (
            <motion.header
              initial={{ y: -72, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -72, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b"
              style={{ backgroundColor: `${C.bg}E8`, borderColor: C.border }}
            >
              <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
                <motion.div animate={{ scale: [1, 1.012, 1] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}>
                  <Logo className="w-36 h-auto" showTagline />
                </motion.div>
                <motion.button
                  onClick={() => setActiveTab(token ? 'dashboard' : 'auth_signup')}
                  animate={btnNudge ? { y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' } : { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="text-[13px] font-bold text-white px-6 py-3.5 rounded-2xl"
                  style={{ backgroundColor: C.text }}
                >
                  {token ? 'Go to Dashboard' : copy.navVerify}
                </motion.button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════
            HERO
            ═══════════════════════════════════ */}
        <section className="relative z-10 min-h-screen flex flex-col">
          <div className="max-w-[1200px] w-full mx-auto px-6 pt-10 flex items-center justify-between h-[72px]">
            <motion.div animate={{ scale: [1, 1.012, 1] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}>
              <Logo className="w-36 h-auto" showTagline />
            </motion.div>
            <motion.button
              onClick={() => setActiveTab(token ? 'dashboard' : 'auth_signup')}
              animate={btnNudge ? { y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' } : { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="text-[13px] font-bold text-white px-6 py-3.5 rounded-2xl"
              style={{ backgroundColor: C.text }}
            >
              {token ? 'Go to Dashboard' : copy.navVerify}
            </motion.button>
          </div>

          <div className="flex-1 flex items-center relative overflow-hidden">
            <FloatingVerifyObjects cursor={cursor} />
            <div className="max-w-[1200px] w-full mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center relative z-10">

              {/* Left — hero text with parallax */}
              <motion.div style={{ y: heroTextY }} className="relative">
                <svg className="absolute -left-12 -top-16 w-[380px] h-[380px] pointer-events-none -z-10 select-none animate-[spin_180s_linear_infinite]"
                  viewBox="0 0 100 100" fill="none" stroke={C.border} strokeWidth="0.5">
                  <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="42" />
                  <polygon points="50,15 53,30 68,30 56,40 60,55 50,45 40,55 44,40 32,30 47,30" />
                  <circle cx="50" cy="50" r="10" />
                </svg>

                <CatchyHeading
                  text={copy.heroH1}
                  delay={0.1}
                  style={{ fontSize: 'clamp(44px, 6vw, 82px)', color: C.text, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05 }}
                />

                <CatchyHeading
                  text={copy.heroH2}
                  delay={0.25}
                  style={{ fontSize: 'clamp(22px, 2.5vw, 34px)', color: C.muted, fontWeight: 400, marginTop: '20px', letterSpacing: '-0.01em' }}
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="mt-8 max-w-[480px] leading-relaxed text-[16px] space-y-4"
                >
                  <div className="space-y-2 border rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.45)', borderColor: C.border }}>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.text }}><span className="text-sm">📩</span>{copy.heroP1}</p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.text }}><span style={{ color: C.red }}>❓</span>{copy.heroP2}</p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.text }}><span>🔍</span>{copy.heroP3}</p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.green }}><span>🟢</span>{copy.heroP4}</p>
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>{copy.heroP5}</p>
                  <p className="font-extrabold" style={{ color: C.text }}>{copy.heroP6} {copy.heroP7}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="mt-8 flex items-center gap-6"
                >
                  <motion.button
                    onClick={() => setActiveTab(token ? 'dashboard' : 'auth_signup')}
                    whileHover={{ scale: 1.03, filter: 'brightness(1.05)', boxShadow: '0 12px 30px rgba(19, 34, 25, 0.22)' }}
                    whileTap={{ scale: 0.97 }}
                    className="text-[15px] font-bold text-white px-8 py-4 rounded-2xl cursor-pointer transition-shadow"
                    style={{ backgroundColor: C.text }}
                  >
                    {token ? 'Go to Dashboard' : copy.btnVerify}
                  </motion.button>
                  <button onClick={scrollToStories} className="text-[15px] font-bold transition-colors hover:opacity-70" style={{ color: C.muted }}>
                    ↓ {copy.btnStories}
                  </button>
                </motion.div>
              </motion.div>

              {/* Right — news clippings with parallax */}
              <motion.div style={{ y: newsCardsY }} className="space-y-4 hidden md:block">
                {!loading && [
                  { text: copy.heroNews1, src: copy.heroNews1Src, rotate: '-1.2deg', variant: 'broadsheet' as const },
                  { text: copy.heroNews2, src: copy.heroNews2Src, rotate: '0.6deg',  variant: 'aged' as const },
                  { text: copy.heroNews3, src: copy.heroNews3Src, rotate: '-0.4deg', variant: 'breaking' as const },
                  { text: copy.heroNews4, src: copy.heroNews4Src, rotate: '0.9deg',  variant: 'digital' as const },
                ].map((item, i) => (
                  <NewsClipping key={i} idx={i} {...item} />
                ))}
                <motion.p
                  initial={{ opacity: 0 }} animate={!loading ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="text-[10px] text-center mt-2 italic"
                  style={{ color: `${C.subtle}66`, fontFamily: 'Georgia, serif' }}
                >
                  Real stories. Real people. Real consequences.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STORY 1 — Voice Clone
            ══════════════════════════════════════ */}
        <InterstitialMessage icon={INTERSTITIALS[0].icon} text={INTERSTITIALS[0].text} />

        <section id="stories" className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Phone — parallax float */}
            <div ref={s1Para.ref}>
              <motion.div
                ref={s1imgRef}
                style={{ y: s1Para.y }}
                initial={{ opacity: 0, y: 30 }} animate={s1ImgView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center"
              >
                <PhoneFrame glitch={s1glitch}>
                  <div className="h-[552px] flex flex-col items-center justify-between py-12"
                    style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
                    <div className="text-center">
                      <div className="w-[72px] h-[72px] rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <span className="text-[28px] font-bold text-white/80">D</span>
                      </div>
                      <p className="text-white text-[28px] font-semibold">Dad</p>
                      <p className="text-white/50 text-[13px] mt-1">Incoming call...</p>
                    </div>
                    <div className="flex items-center gap-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center" style={{ backgroundColor: C.red }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </div>
                        <span className="text-white/50 text-[11px]">Decline</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center" style={{ backgroundColor: C.green }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <span className="text-white/50 text-[11px]">Accept</span>
                      </div>
                    </div>
                  </div>
                </PhoneFrame>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={s1ImgView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 text-center"
                >
                  <div className="inline-block rounded-2xl px-5 py-3 text-[15px] italic shadow-sm border-2"
                    style={{ backgroundColor: C.card, borderColor: C.border, color: C.text }}>
                    {copy.s1Bubble}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="pt-8 lg:pt-20">
              <div className="flex items-center gap-3 mb-4">
                <WaveformBars error />
                <span className="text-[13px] font-mono font-bold" style={{ color: C.subtle }}>0:18</span>
              </div>
              <StoryText quote={copy.s1Reveal} badge={copy.s1Result} news={copy.s1News} newsSrc={copy.s1NewsSrc} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STORY 2 — Fake Document
            ══════════════════════════════════════ */}
        <InterstitialMessage icon={INTERSTITIALS[1].icon} text={INTERSTITIALS[1].text} />

        <section className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="pt-4 order-2 lg:order-1">
              <StoryText quote={copy.s2Reveal} badge={copy.s2Result} news={copy.s2News} newsSrc={copy.s2NewsSrc} />
            </div>

            <div ref={s2Para.ref} className="order-1 lg:order-2">
              <motion.div
                ref={s2imgRef}
                style={{ y: s2Para.y }}
                initial={{ opacity: 0, y: 30 }} animate={s2ImgView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-[520px] bg-white rounded-2xl border-2 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.1)] overflow-hidden" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-2 px-4 py-3.5 border-b" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${C.red}99` }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C4A24E]/60" />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${C.green}99` }} />
                    <span className="ml-3 text-[12px] font-bold" style={{ color: C.subtle }}>Mail</span>
                  </div>
                  <div className="px-6 py-4 border-b" style={{ borderColor: `${C.border}88` }}>
                    <p className="text-[13px]" style={{ color: C.subtle }}>
                      From: <span className="font-bold" style={{ color: C.red }}>{copy.s2From}</span>
                      {s2ImgView && <FlagLabel text={copy.s2Flag1} visible delay={0.4} />}
                    </p>
                    <p className="text-[15px] font-bold mt-1" style={{ color: C.text }}>{copy.s2Subject}</p>
                  </div>
                  <div className="px-6 py-5 space-y-4 text-[14px] leading-relaxed" style={{ color: C.text }}>
                    <p>{copy.s2Body1}</p>
                    <p style={{ color: C.muted }}>{copy.s2Body2}</p>
                    <p className="font-extrabold">{copy.s2Body3}</p>
                    <p style={{ color: C.muted }}>{copy.s2Body4}</p>
                    <div className="flex items-center gap-3 mt-4 p-3 rounded-xl border relative overflow-hidden" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span className="text-[13px] font-bold z-10" style={{ color: C.muted }}>{copy.s2Attach}</span>
                      {/* Scanning laser beam */}
                      <motion.div 
                        className="absolute bottom-0 left-0 h-0.5 bg-accent-green/60 shadow-[0_0_4px_#3E5C4B]"
                        animate={{ left: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="mt-4 pt-4 border-t relative" style={{ borderColor: `${C.border}88` }}>
                      <p className="text-[13px]" style={{ color: C.subtle }}>Best regards,</p>
                      <p className="text-[14px] font-bold italic mt-1" style={{ color: C.text }}>Ravi Mehta</p>
                      <p className="text-[12px] font-medium" style={{ color: C.subtle }}>Talent Acquisition Lead</p>
                      {s2ImgView && <div className="absolute top-2 right-0"><FlagLabel text={copy.s2Flag2} visible delay={0.6} /></div>}
                    </div>
                  </div>
                  <AnimatePresence>
                    {s2ImgView && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.4, delay: 0.7 }}
                        className="px-6 py-3.5 border-t text-[12px] font-bold"
                        style={{ backgroundColor: `${C.red}0D`, borderColor: `${C.red}33`, color: C.red }}>
                        {copy.s2Meta}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STORY 3 — WhatsApp Image
            ══════════════════════════════════════ */}
        <InterstitialMessage icon={INTERSTITIALS[2].icon} text={INTERSTITIALS[2].text} />

        <section className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div ref={s3Para.ref}>
              <motion.div
                ref={s3imgRef}
                style={{ y: s3Para.y }}
                initial={{ opacity: 0, y: 30 }} animate={s3ImgView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-[390px] rounded-2xl overflow-hidden border-2 shadow-[0_32px_96px_-16px_rgba(0,0,0,0.1)]" style={{ borderColor: C.border }}>
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
                      <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2 text-[13px] shadow-sm" style={{ color: C.text }}>{copy.s3Msg1}</div>
                    </div>
                    <div className="max-w-[85%] relative">
                      <div className="bg-white rounded-xl rounded-tl-sm overflow-hidden shadow-sm relative" style={s3ImgView ? { outline: `2px solid ${C.red}66` } : {}}>
                        <div className="bg-[#1a3a5c] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-[20px] h-[20px] rounded-full bg-white/20" />
                            <span className="text-[10px] text-white/80 font-bold">GOVT. NEWS</span>
                          </div>
                        </div>
                        <div className="px-3 py-3 bg-white">
                          <p className="text-[12px] font-bold leading-tight" style={{ color: C.text }}>{copy.s3Headline}</p>
                          <p className="text-[10px] mt-1 font-bold" style={{ color: C.subtle }}>governmentnews.co.in</p>
                        </div>
                        {s3ImgView && (
                          <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${C.red}12 4px, ${C.red}12 5px)` }} />
                            {/* Scanning laser beam */}
                            <motion.div 
                              className="absolute left-0 right-0 h-[2px] bg-accent-red/60 pointer-events-none z-10 shadow-[0_0_6px_#A1493F]"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </>
                        )}
                      </div>
                      {s3ImgView && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          <FlagLabel text={copy.s3Flag1} visible delay={0.5} />
                          <FlagLabel text={copy.s3Flag2} visible delay={0.65} />
                          <FlagLabel text={copy.s3Flag3} visible delay={0.8} />
                        </div>
                      )}
                    </div>
                    <div className="max-w-[85%]">
                      <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2 text-[13px] shadow-sm" style={{ color: C.text }}>{copy.s3Msg2}</div>
                    </div>
                    <div className="max-w-[75%] ml-auto">
                      <div className="rounded-xl rounded-tr-sm px-3.5 py-2 text-[13px] shadow-sm" style={{ backgroundColor: '#DCF8C6', color: C.text }}>{copy.s3Sent}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="pt-4 lg:pt-16">
              <StoryText quote={copy.s3Reveal} badge={copy.s3Result} news={copy.s3News} newsSrc={copy.s3NewsSrc} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            STORY 4 — Voice Detection (replaces video)
            A vishing attack disguised as a bank call
            ══════════════════════════════════════ */}
        <InterstitialMessage icon={INTERSTITIALS[3].icon} text={INTERSTITIALS[3].text} />

        <section className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Text first (alternating) */}
            <div className="pt-8 lg:pt-20 order-2 lg:order-1">
              <StoryText
                quote={copy.s4Reveal}
                badge={copy.s4Result}
                news={copy.s4News}
                newsSrc={copy.s4NewsSrc}
                flags={[copy.s4Flag1, copy.s4Flag2, copy.s4Flag3]}
              />
            </div>

            {/* Voice analysis phone UI — parallax */}
            <div ref={s4Para.ref} className="order-1 lg:order-2">
              <motion.div
                ref={s4imgRef}
                style={{ y: s4Para.y }}
                initial={{ opacity: 0, y: 30 }} animate={s4ImgView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center"
              >
                <PhoneFrame>
                  <div className="h-[552px] flex flex-col" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}>
                    {/* Top bar */}
                    <div className="px-5 pt-10 pb-4 border-b border-white/5">
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Voice Analysis</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-[16px] font-bold">{copy.s4Caller}</p>
                          <p className="text-white/40 text-[11px] mt-0.5">Received audio message · {copy.s4Duration}</p>
                        </div>
                        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center" style={{ backgroundColor: `${C.green}22`, border: `1px solid ${C.green}44` }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Waveform visualiser */}
                    <div className="px-5 py-6 flex flex-col gap-4">
                      <div className="flex justify-center">
                        <WaveformBars error={s4anim} animated={s4ImgView && !s4anim} />
                      </div>

                      {/* Transcript bubble */}
                      <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                        <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">Transcript</p>
                        <p className="text-white/80 text-[12px] leading-relaxed italic">{copy.s4Transcript}</p>
                      </div>

                      {/* Analysis result */}
                      <AnimatePresence>
                        {s4anim && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="rounded-2xl p-4 border"
                            style={{ backgroundColor: `${C.red}12`, borderColor: `${C.red}44` }}
                          >
                            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: C.red }}>⚠ AI Voice Detected</p>
                            <div className="space-y-2">
                              {[
                                { label: 'Synthetic patterns', val: 94 },
                                { label: 'Natural variance', val: 8 },
                                { label: 'Background authenticity', val: 12 },
                              ].map((item, i) => (
                                <div key={i}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-[10px] text-white/50">{item.label}</span>
                                    <span className="text-[10px] font-bold" style={{ color: item.val > 50 ? C.red : C.green }}>{item.val}%</span>
                                  </div>
                                  <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.val}%` }}
                                      transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: item.val > 50 ? C.red : C.green }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </PhoneFrame>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            INTERACTIVE — What would you verify?
            ══════════════════════════════════════ */}
        <InterstitialMessage icon={INTERSTITIALS[4].icon} text={INTERSTITIALS[4].text} />

        <section className="relative z-10 py-24">
          <div className="max-w-[960px] mx-auto px-6">
              <CatchyHeading
                text={copy.interTitle}
                className="justify-center text-center font-bold tracking-tight mb-3"
                style={{ fontSize: 'clamp(30px, 4vw, 44px)', color: C.text }}
              />
              <Reveal>
                <p className="text-center text-[16px] font-medium mb-12 max-w-[520px] mx-auto leading-relaxed" style={{ color: C.muted }}>
                  Every day, people encounter something online that doesn't feel quite right. These are the moments PARAKH was built for.
                </p>
              </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
              {verifyCards.map((card, i) => (
                <VerifyCard key={i} icon={card.icon} label={card.label} desc={card.desc} delay={i * 0.1} />
              ))}
            </div>

            <Reveal delay={0.12}>
              <div className="flex justify-center gap-2 mb-8 bg-[#EFECE5]/80 p-1.5 rounded-2xl border max-w-max mx-auto" style={{ borderColor: C.border }}>
                {[
                  { key: 'voice', label: copy.tabVoice },
                  { key: 'doc',   label: copy.tabDoc },
                  { key: 'image', label: copy.tabImage },
                  { key: 'live',  label: copy.tabLive },
                ].map(({ key, label }) => {
                  const isActive = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setTab(key); setDemoState('idle'); setProgress(0); }}
                      className="relative px-6 py-2.5 rounded-xl text-[14px] font-bold transition-colors duration-200 focus:outline-none"
                      style={{ color: isActive ? '#fff' : C.muted }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-xl shadow-sm z-0"
                          style={{ backgroundColor: C.text }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-3xl p-8 border-2 shadow-sm max-w-[640px] mx-auto" style={{ backgroundColor: C.card, borderColor: C.border }}>
                {demoState === 'idle' && (
                  <div onClick={startDemo} className="border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-colors" style={{ borderColor: C.border }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="1.5" className="mx-auto mb-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p className="text-[15px] font-bold" style={{ color: C.muted }}>{copy.interDrop}</p>
                  </div>
                )}
                {demoState === 'progress' && (
                  <DemoAnalysisProgress activeTab={activeTab} progress={progress} />
                )}
                {demoState === 'done' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="py-8 text-center space-y-4">
                    <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center mx-auto border"
                      style={{ backgroundColor: `${C.green}1A`, borderColor: `${C.green}44` }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[18px] font-extrabold" style={{ color: C.green }}>{copy.interDone}</p>
                    <button onClick={() => setActiveTab(token ? 'dashboard' : 'auth_signup')} className="text-[13px] underline underline-offset-4 font-bold" style={{ color: C.muted }}>
                      {token ? 'View full reports in Dashboard' : 'Sign up for full reports'}
                    </button>
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TRUST — Cinematic sequential reveal
            ══════════════════════════════════════ */}
        <section className="relative z-10 pt-12 pb-24 overflow-hidden" ref={trustRef}>
          <motion.div
            initial={{ opacity: 0 }} animate={trustInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${C.green}0E 0%, transparent 70%)` }}
          />
          <div className="max-w-[720px] mx-auto px-6">
            <div className="text-center mb-14">
                {trustStep >= 0 && (
                  <CatchyHeading
                    text={copy.trustH}
                    className="justify-center text-center font-extrabold tracking-tight leading-tight"
                    style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: C.text }}
                  />
                )}
              <AnimatePresence>
                {trustStep >= 1 && (
                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}
                    className="mt-5 text-[18px] font-semibold leading-relaxed" style={{ color: C.text }}>
                    {copy.trustP1}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="relative mb-10 ml-4">
              <motion.div
                initial={{ scaleY: 0 }} animate={lineGrow ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute left-0 top-0 bottom-0 w-[4px] rounded-full origin-top"
                style={{ backgroundColor: `${C.green}55` }}
              />
              <div className="pl-6 space-y-5">
                {copy.trustLines.map((line, i) => (
                  <AnimatePresence key={i}>
                    {trustStep >= i + 2 && (
                      <motion.p
                        initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                        className="text-[22px] leading-snug font-medium" style={{ color: C.muted }}>
                        {line}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>

            <div className="text-center my-10">
              <AnimatePresence>
                {trustStep >= 6 && (
                  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="inline-block relative">
                    <p className="text-[26px] font-extrabold" style={{ color: C.text }}>{copy.trustConclusion}</p>
                    <svg className="absolute -bottom-2 left-0 w-full overflow-visible" height="8" viewBox="0 0 300 8" preserveAspectRatio="none">
                      <motion.path
                        d="M2,5 C30,2 60,7 90,4 C120,1 150,6 180,4 C210,2 240,7 270,4 C285,3 295,5 298,5"
                        stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.0, ease: 'easeInOut', delay: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {trustStep >= 7 && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative text-center pt-8">
                  <div className="w-12 h-[3px] rounded-full mx-auto mb-6" style={{ backgroundColor: `${C.green}66` }} />
                  <p className="text-[20px] font-extrabold leading-relaxed" style={{ color: C.green }}>{copy.trustClose}</p>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-8 top-0 w-[80px] h-[80px] rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: `${C.green}18` }} />
                  <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -left-10 bottom-0 w-[60px] h-[60px] rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: `${C.green}12` }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FINAL CTA
            ══════════════════════════════════════ */}
        <section className="relative z-10 min-h-[50vh] flex items-center justify-center pt-8 pb-16">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <CatchyHeading
              text={copy.ctaH1}
              className="justify-center text-center font-extrabold tracking-tight leading-[1.15]"
              style={{ fontSize: 'clamp(34px, 5vw, 60px)', color: C.text }}
            />
            <Reveal delay={0.25}>
              <p className="mt-5" style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: C.muted }}>{copy.ctaH2}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <motion.button
                onClick={() => setActiveTab(token ? 'dashboard' : 'auth_signup')}
                animate={btnNudge ? { y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' } : { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="mt-10 text-[16px] font-bold text-white px-9 py-4 rounded-2xl"
                style={{ backgroundColor: C.text }}
              >
                {token ? 'Return to your Dashboard' : copy.ctaBtn}
              </motion.button>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
            ══════════════════════════════════════ */}
        <footer className="relative z-10 border-t" style={{ borderColor: C.border }}>
          <div className="max-w-[1200px] mx-auto px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div>
                <div className="max-w-[110px] mb-4"><Logo showTagline={false} /></div>
                <p className="text-[13px] font-medium leading-relaxed max-w-[220px]" style={{ color: C.green }}>
                  Digital verification for a world where everything looks real.
                </p>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: C.green }}>Verify</p>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Voice & Audio', tab: 'voice' },
                    { label: 'Documents & PDFs', tab: 'document' },
                    { label: 'Images & Screenshots', tab: 'image' },
                    { label: 'Websites & Links', tab: 'website' },
                    { label: 'QR Codes', tab: 'qr' },
                    { label: 'Emails', tab: 'email' }
                  ].map((item) => (
                    <li key={item.label}>
                      <button 
                        onClick={() => setActiveTab(token ? item.tab : 'auth_signup')} 
                        className="text-[13px] font-medium hover:underline underline-offset-4" 
                        style={{ color: C.green }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: C.green }}>Why PARAKH</p>
                <p className="text-[13px] font-medium leading-relaxed" style={{ color: C.green }}>
                  Built for people who want to be sure before they trust. Every verification is private, instant, and yours.
                </p>
                <button 
                  onClick={() => setActiveTab(token ? 'dashboard' : 'auth_signup')}
                  className="mt-5 inline-block text-[13px] font-extrabold px-5 py-2.5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                  style={{ color: C.green, borderColor: `${C.green}44`, backgroundColor: `${C.green}08` }}
                >
                  {token ? 'Go to Dashboard →' : 'Get started free →'}
                </button>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: C.border }}>
              <p className="text-[12px] font-medium" style={{ color: `${C.green}99` }}>© 2025 PARAKH. All rights reserved.</p>
              <div className="flex items-center gap-5">
                {['Privacy', 'Terms', 'Contact'].map((link) => (
                  <button key={link} className="text-[12px] font-semibold hover:underline underline-offset-4" style={{ color: C.green }}>{link}</button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }
        .float-phone { animation: float 5s ease-in-out infinite; }

        @keyframes glitch {
          0%,100%{transform:translate(0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px);opacity:.9}
          60%{transform:translate(-1px,-1px)} 80%{transform:translate(1px,2px);opacity:.95}
        }

        @keyframes noiseDrift {
          0%{transform:translate(0,0)} 33%{transform:translate(-6px,-4px)} 66%{transform:translate(4px,-7px)} 100%{transform:translate(0,0)}
        }
        .noise-drift { animation: noiseDrift 28s ease-in-out infinite; will-change: transform; }

        .clipping-card::before {
          content:''; position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity:0.04; pointer-events:none; border-radius:inherit;
        }
      `}</style>
    </>
  );
}
