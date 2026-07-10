import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Logo from '../components/Logo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Brand palette ─── */
const C = {
  bg:         '#F6F4EF',
  card:       '#FBFAF8',
  text:       '#181818',
  muted:      '#4b4845',
  subtle:     '#666666',
  green:      '#3E5C4B',
  red:        '#A1493F',
  border:     '#E4E1DA',
};

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

/* ─── Generic scroll-reveal wrapper ─── */
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

/* ─── Interstitial scrollytelling banner ─── */
function InterstitialMessage({ icon, text }: { icon: string; text: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="relative z-10 py-10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px pointer-events-none" style={{ backgroundColor: C.border }} />
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
    <div className={`relative mx-auto w-[322px] rounded-[42px] bg-[#181818] p-[12px] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.18)] float-phone border border-white/5 ${glitch ? 'animate-[glitch_0.3s_ease-in-out_3]' : ''}`}>
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-[#181818] rounded-b-2xl z-10" />
      <div className="rounded-[32px] overflow-hidden bg-[#111]">{children}</div>
    </div>
  );
}

/* ─── Waveform ─── */
function WaveformBars({ error = false }: { error?: boolean }) {
  const heights = [12, 20, 8, 24, 14, 18, 10, 22, 16, 6, 20, 12, 18, 8, 14];
  return (
    <div className="flex items-end gap-[2px] h-[28px]">
      {heights.map((h, i) => (
        <div key={i} className="w-[3px] rounded-full" style={{ height: `${h}px`, backgroundColor: error ? C.red : C.green }} />
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
      className="rounded-3xl p-6 flex flex-col gap-3 border-2 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
      style={{ backgroundColor: C.card, borderColor: C.border }}
    >
      <span className="text-[32px] select-none">{icon}</span>
      <p className="text-[16px] font-extrabold leading-snug" style={{ color: C.text }}>{label}</p>
      <p className="text-[13px] leading-relaxed font-medium" style={{ color: C.muted }}>{desc}</p>
    </motion.div>
  );
}

/* ─── Story text panel — per-element scroll triggers ─── */
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
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.08 }}
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
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: 0.12 }}
        className="rounded-3xl p-6 border-2 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        style={{ backgroundColor: C.card, borderColor: C.border }}
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

/* ─── Newspaper clipping component ─── */
function NewsClipping({ text, src, rotate, variant, idx }: {
  text: string; src: string; rotate: string;
  variant: 'broadsheet' | 'aged' | 'breaking' | 'digital';
  idx: number;
}) {
  const bgMap = { broadsheet: '#FFFEF9', aged: '#FAF7EE', breaking: '#FFFCFA', digital: '#F8F9FF' };
  const bg = bgMap[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{ duration: 0.5, delay: 0.5 + idx * 0.12 }}
      className="relative shadow-lg hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-default clipping-card"
      style={{
        backgroundColor: bg,
        transform: `rotate(${rotate})`,
        borderRadius: '2px',
        padding: variant === 'broadsheet' ? '0' : '0',
      }}
    >
      {/* Top border accent */}
      <div className="h-[3px] w-full" style={{
        backgroundColor: variant === 'breaking' ? C.red : variant === 'digital' ? C.green : '#2A2A2A',
      }} />

      <div className="px-5 py-4">
        {/* Source label row */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[9px] font-extrabold uppercase tracking-[0.18em]"
            style={{ color: variant === 'breaking' ? C.red : '#2A2A2A', fontFamily: 'Georgia, serif' }}
          >
            {variant === 'breaking' ? '⚡ Breaking' : variant === 'aged' ? 'Archive' : variant === 'digital' ? 'Online' : 'National'}
          </span>
          <span className="text-[9px]" style={{ color: C.subtle, fontFamily: 'Georgia, serif' }}>{src}</span>
        </div>

        {/* Divider rule */}
        <div className="w-full h-px mb-3" style={{ backgroundColor: '#2A2A2A33' }} />

        {/* Headline */}
        <p
          className="leading-snug"
          style={{
            color: '#1A1A1A',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: variant === 'broadsheet' ? '14px' : '13px',
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {text}
        </p>

        {/* Bottom meta */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.red }} />
          <span className="text-[9px]" style={{ color: C.subtle, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Verified report
          </span>
        </div>
      </div>

      {/* Paper fold crease at bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6"
        style={{
          background: `linear-gradient(135deg, transparent 50%, ${variant === 'aged' ? '#E8E0C8' : '#E8E6E0'} 50%)`,
        }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { setActiveTab } = useStore();

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

  /* Nav scroll */
  const [showNav, setShowNav] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowNav(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Cursor spotlight ── */
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const h = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  /* ── Verify button nudge every 9s ── */
  const [btnNudge, setBtnNudge] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setBtnNudge(true);
      setTimeout(() => setBtnNudge(false), 700);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  /* ── Subtle bg shift on scroll ── */
  const [scrollFrac, setScrollFrac] = useState(0);
  useEffect(() => {
    const h = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setScrollFrac(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  // interpolate #F6F4EF → #F1EDE6 based on scroll
  const r1=246,g1=244,b1=239, r2=241,g2=237,b2=230;
  const bgColor = `rgb(${Math.round(r1+(r2-r1)*scrollFrac)},${Math.round(g1+(g2-g1)*scrollFrac)},${Math.round(b1+(b2-b1)*scrollFrac)})`;

  /* Story image reveal refs */
  const s1imgRef = useRef(null); const s2imgRef = useRef(null);
  const s3imgRef = useRef(null); const s4imgRef = useRef(null);
  const s1ImgView = useInView(s1imgRef, { once: true, margin: '-80px' });
  const s2ImgView = useInView(s2imgRef, { once: true, margin: '-80px' });
  const s3ImgView = useInView(s3imgRef, { once: true, margin: '-80px' });
  const s4ImgView = useInView(s4imgRef, { once: true, margin: '-80px' });

  const [s1glitch, setS1glitch] = useState(false);
  const [s4glitch, setS4glitch] = useState(false);
  useEffect(() => { if (s1ImgView) setTimeout(() => setS1glitch(true), 1200); }, [s1ImgView]);
  useEffect(() => { if (s4ImgView) setTimeout(() => setS4glitch(true), 1200); }, [s4ImgView]);

  /* Interactive demo */
  const [activeTab, setTab] = useState('voice');
  const [demoState, setDemoState] = useState<'idle'|'progress'|'done'>('idle');
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
    { icon: '🎬', label: 'Video of a public figure', desc: 'A famous face promoting something suspicious. Real voice or deepfake?' },
  ];

  /* ════════════════════════════════════════════════════════
     TRUST SECTION — Cinematic sequential reveal
     Each line appears one by one with deliberate pauses.
     trustStep: -1 = nothing, 0 = headline, 1 = subtext,
                2..5 = "every..." lines, 6 = conclusion, 7 = close
     ════════════════════════════════════════════════════════ */
  const trustRef  = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: '-100px' });
  const [trustStep, setTrustStep] = useState(-1);
  const lineStarted = useRef(false);

  useEffect(() => {
    if (!trustInView || lineStarted.current) return;
    lineStarted.current = true;
    // Stagger: headline → subtext → line1 → line2 → line3 → line4 → conclusion → close
    const delays = [0, 600, 1300, 2000, 2700, 3400, 4300, 5100];
    delays.forEach((d, i) => setTimeout(() => setTrustStep(i), d));
  }, [trustInView]);

  /* Vertical line grows once trust section in view */
  const [lineGrow, setLineGrow] = useState(false);
  useEffect(() => { if (trustInView) setTimeout(() => setLineGrow(true), 1200); }, [trustInView]);

  return (
    <>
      {/* ─── Cursor spotlight ─── */}
      <div
        className="fixed pointer-events-none z-[200]"
        style={{
          left: cursor.x - 200,
          top: cursor.y - 200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(246,244,235,0.10) 0%, transparent 70%)',
          transition: 'left 0.12s ease-out, top 0.12s ease-out',
        }}
      />

      {/* ─── LOADING SCREEN ─── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: C.bg }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-w-[200px]">
              <Logo />
            </motion.div>
            <div className="mt-8 h-[24px] relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadLineIdx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-[15px] absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ color: C.muted, fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                >
                  {LOADING_LINES[loadLineIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden antialiased relative" style={{ backgroundColor: bgColor, color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ─── Background textures ─── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Drifting paper noise */}
          <div
            className="absolute inset-0 opacity-[0.025] noise-drift"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: `radial-gradient(${C.text} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/4 w-[80vw] h-[80vw] rounded-full blur-[120px] -translate-y-1/2" style={{ backgroundColor: `${C.green}0F` }} />
          <div className="absolute top-[40%] right-0 w-[60vw] h-[60vw] rounded-full blur-[140px]" style={{ backgroundColor: `${C.red}0A` }} />
          <div className="absolute bottom-[10%] left-10 w-[70vw] h-[70vw] rounded-full blur-[150px]" style={{ backgroundColor: `${C.green}0C` }} />
        </div>

        {/* Margin guide lines */}
        <div className="hidden lg:block fixed left-[5%] top-0 bottom-0 w-[1px] pointer-events-none z-0" style={{ backgroundColor: `${C.border}60` }} />
        <div className="hidden lg:block fixed right-[5%] top-0 bottom-0 w-[1px] pointer-events-none z-0" style={{ backgroundColor: `${C.border}60` }} />

        {/* ─── FIXED NAV ─── */}
        <AnimatePresence>
          {showNav && (
            <motion.header
              initial={{ y: -72, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -72, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b"
              style={{ backgroundColor: `${C.bg}E8`, borderColor: C.border }}
            >
              <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
                <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Logo className="w-36 h-auto" showTagline={true} />
                </div>
                <motion.button
                  onClick={() => setActiveTab('auth_signup')}
                  animate={btnNudge ? { y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' } : { y: 0, boxShadow: '0 0px 0px rgba(0,0,0,0)' }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="text-[13px] font-bold text-white px-6 py-3.5 rounded-2xl"
                  style={{ backgroundColor: C.text }}
                >
                  {copy.navVerify}
                </motion.button>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ─── HERO ─── */}
        <section className="relative z-10 min-h-screen flex flex-col">
          <div className="max-w-[1200px] w-full mx-auto px-6 pt-10 flex items-center justify-between h-[72px]">
            {/* Logo — gentle breathing pulse */}
            <motion.div
              animate={{ scale: [1, 1.012, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
            >
              <Logo className="w-36 h-auto" showTagline={true} />
            </motion.div>

            <motion.button
              onClick={() => setActiveTab('auth_signup')}
              animate={btnNudge ? { y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.14)' } : { y: 0, boxShadow: '0 0px 0px rgba(0,0,0,0)' }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="text-[13px] font-bold text-white px-6 py-3.5 rounded-2xl"
              style={{ backgroundColor: C.text }}
            >
              {copy.navVerify}
            </motion.button>
          </div>

          <div className="flex-1 flex items-center">
            <div className="max-w-[1200px] w-full mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
              <div className="relative">
                <svg className="absolute -left-12 -top-16 w-[380px] h-[380px] pointer-events-none -z-10 select-none animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke={C.border} strokeWidth="0.5">
                  <circle cx="50" cy="50" r="48" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="42" />
                  <polygon points="50,15 53,30 68,30 56,40 60,55 50,45 40,55 44,40 32,30 47,30" />
                  <circle cx="50" cy="50" r="10" />
                </svg>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="font-extrabold tracking-tight leading-[1.05]"
                  style={{ fontSize: 'clamp(44px, 6vw, 82px)', color: C.text }}
                >
                  {copy.heroH1}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.25 }}
                  className="mt-5 font-normal"
                  style={{ fontSize: 'clamp(22px, 2.5vw, 34px)', color: C.muted }}
                >
                  {copy.heroH2}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="mt-8 max-w-[480px] leading-relaxed text-[16px] space-y-4"
                >
                  <div className="space-y-2 border rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.45)', borderColor: C.border }}>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.text }}><span className="text-sm">📩</span><span>{copy.heroP1}</span></p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.text }}><span className="text-sm" style={{ color: C.red }}>❓</span><span>{copy.heroP2}</span></p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.text }}><span className="text-sm">🔍</span><span>{copy.heroP3}</span></p>
                    <p className="flex items-center gap-2.5 font-bold" style={{ color: C.green }}><span className="text-sm">🟢</span><span>{copy.heroP4}</span></p>
                  </div>
                  <p className="text-[14px] leading-relaxed mt-2" style={{ color: C.muted }}>{copy.heroP5}</p>
                  <p className="font-extrabold" style={{ color: C.text }}>{copy.heroP6} {copy.heroP7}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={!loading ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="mt-8 flex items-center gap-6"
                >
                  <motion.button
                    onClick={() => setActiveTab('auth_signup')}
                    animate={btnNudge ? { y: -4, boxShadow: '0 10px 28px rgba(0,0,0,0.16)' } : { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="text-[15px] font-bold text-white px-8 py-4 rounded-2xl"
                    style={{ backgroundColor: C.text }}
                  >
                    {copy.btnVerify}
                  </motion.button>
                  <button onClick={scrollToStories} className="text-[15px] font-bold transition-colors hover:opacity-70" style={{ color: C.muted }}>
                    ↓ {copy.btnStories}
                  </button>
                </motion.div>
              </div>

              {/* Right: Newspaper clippings */}
              <div className="space-y-4 hidden md:block">
                {[
                  { text: copy.heroNews1, src: copy.heroNews1Src, rotate: '-1.2deg', variant: 'broadsheet' as const },
                  { text: copy.heroNews2, src: copy.heroNews2Src, rotate: '0.6deg',  variant: 'aged' as const },
                  { text: copy.heroNews3, src: copy.heroNews3Src, rotate: '-0.4deg', variant: 'breaking' as const },
                  { text: copy.heroNews4, src: copy.heroNews4Src, rotate: '0.9deg',  variant: 'digital' as const },
                ].map((item, i) => !loading && (
                  <NewsClipping key={i} idx={i} text={item.text} src={item.src} rotate={item.rotate} variant={item.variant} />
                ))}
                <motion.p
                  initial={{ opacity: 0 }} animate={!loading ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="text-[10px] text-center mt-2 italic"
                  style={{ color: `${C.subtle}66`, fontFamily: 'Georgia, serif' }}
                >
                  Real stories. Real people. Real consequences.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERSTITIALS & STORIES ── */}
        <InterstitialMessage icon={INTERSTITIALS[0].icon} text={INTERSTITIALS[0].text} />

        {/* ════ STORY 1 — Voice Clone ════ */}
        <section id="stories" className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              ref={s1imgRef}
              initial={{ opacity: 0, y: 30 }} animate={s1ImgView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center"
            >
              <PhoneFrame glitch={s1glitch}>
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
                <div className="inline-block rounded-2xl px-5 py-3 text-[15px] italic shadow-sm border-2" style={{ backgroundColor: C.card, borderColor: C.border, color: C.text }}>
                  {copy.s1Bubble}
                </div>
              </motion.div>
            </motion.div>

            <div className="pt-8 lg:pt-20">
              <div className="flex items-center gap-3 mb-4">
                <WaveformBars error />
                <span className="text-[13px] font-mono font-bold" style={{ color: C.subtle }}>0:18</span>
              </div>
              <StoryText quote={copy.s1Reveal} badge={copy.s1Result} news={copy.s1News} newsSrc={copy.s1NewsSrc} />
            </div>
          </div>
        </section>

        <InterstitialMessage icon={INTERSTITIALS[1].icon} text={INTERSTITIALS[1].text} />

        {/* ════ STORY 2 — Fake Document ════ */}
        <section className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="pt-4 order-2 lg:order-1">
              <StoryText quote={copy.s2Reveal} badge={copy.s2Result} news={copy.s2News} newsSrc={copy.s2NewsSrc} />
            </div>

            <motion.div
              ref={s2imgRef}
              initial={{ opacity: 0, y: 30 }} animate={s2ImgView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full flex justify-center order-1 lg:order-2"
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
                  <div className="flex items-center gap-3 mt-4 p-3 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="text-[13px] font-bold" style={{ color: C.muted }}>{copy.s2Attach}</span>
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
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                      className="px-6 py-3.5 border-t text-[12px] font-bold"
                      style={{ backgroundColor: `${C.red}0D`, borderColor: `${C.red}33`, color: C.red }}
                    >
                      {copy.s2Meta}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        <InterstitialMessage icon={INTERSTITIALS[2].icon} text={INTERSTITIALS[2].text} />

        {/* ════ STORY 3 — WhatsApp Image ════ */}
        <section className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              ref={s3imgRef}
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${C.red}12 4px, ${C.red}12 5px)` }} />
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

            <div className="pt-4 lg:pt-16">
              <StoryText quote={copy.s3Reveal} badge={copy.s3Result} news={copy.s3News} newsSrc={copy.s3NewsSrc} />
            </div>
          </div>
        </section>

        <InterstitialMessage icon={INTERSTITIALS[3].icon} text={INTERSTITIALS[3].text} />

        {/* ════ STORY 4 — Deepfake Reel ════ */}
        <section className="relative z-10 py-20">
          <div className="max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="pt-8 lg:pt-20 order-2 lg:order-1">
              <StoryText quote={copy.s4Reveal} badge={copy.s4Result} news={copy.s4News} newsSrc={copy.s4NewsSrc} flags={[copy.s4Flag1, copy.s4Flag2]} />
            </div>

            <motion.div
              ref={s4imgRef}
              initial={{ opacity: 0, y: 30 }} animate={s4ImgView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center order-1 lg:order-2"
            >
              <PhoneFrame glitch={s4glitch}>
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
                  {s4glitch && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="absolute inset-0 pointer-events-none z-20" style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${C.red}18 3px, ${C.red}18 4px)` }} />
                  )}
                </div>
              </PhoneFrame>
            </motion.div>
          </div>
        </section>

        <InterstitialMessage icon={INTERSTITIALS[4].icon} text={INTERSTITIALS[4].text} />

        {/* ════ INTERACTIVE ════ */}
        <section className="relative z-10 py-24">
          <div className="max-w-[960px] mx-auto px-6">
            <Reveal>
              <h2 className="text-center font-bold tracking-tight mb-3" style={{ fontSize: 'clamp(30px, 4vw, 44px)', color: C.text }}>
                {copy.interTitle}
              </h2>
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
              <div className="flex justify-center gap-2 mb-8">
                {['voice', 'doc', 'image', 'video'].map((tab) => {
                  const labels: Record<string,string> = { voice: copy.tabVoice, doc: copy.tabDoc, image: copy.tabImage, video: copy.tabVideo };
                  return (
                    <button
                      key={tab}
                      onClick={() => { setTab(tab); setDemoState('idle'); setProgress(0); }}
                      className="px-5 py-3 rounded-xl text-[14px] font-bold transition-all"
                      style={{
                        backgroundColor: activeTab === tab ? C.text : 'transparent',
                        color: activeTab === tab ? '#fff' : C.muted,
                        border: activeTab === tab ? 'none' : `2px solid ${C.border}`,
                      }}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-3xl p-8 border-2 shadow-sm max-w-[640px] mx-auto" style={{ backgroundColor: C.card, borderColor: C.border }}>
                {demoState === 'idle' && (
                  <div onClick={startDemo} className="border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-colors" style={{ borderColor: C.border }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="1.5" className="mx-auto mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p className="text-[15px] font-bold" style={{ color: C.muted }}>{copy.interDrop}</p>
                  </div>
                )}
                {demoState === 'progress' && (
                  <div className="py-8 text-center space-y-5">
                    <p className="text-[15px] font-bold" style={{ color: C.muted }}>{copy.interAnalyze}</p>
                    <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: C.green, width: `${progress}%` }} transition={{ ease: 'linear' }} />
                    </div>
                  </div>
                )}
                {demoState === 'done' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="py-8 text-center space-y-4">
                    <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center mx-auto border" style={{ backgroundColor: `${C.green}1A`, borderColor: `${C.green}44` }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[18px] font-extrabold" style={{ color: C.green }}>{copy.interDone}</p>
                    <button onClick={() => setActiveTab('auth_signup')} className="text-[13px] underline underline-offset-4 transition-colors font-bold" style={{ color: C.muted }}>
                      Sign up for full reports
                    </button>
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════ TRUST — Cinematic sequential reveal ════ */}
        <section className="relative z-10 py-28 overflow-hidden" ref={trustRef}>
          {/* Ambient green wash */}
          <motion.div
            initial={{ opacity: 0 }} animate={trustInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${C.green}0E 0%, transparent 70%)` }}
          />

          <div className="max-w-[720px] mx-auto px-6">
            {/* 0: Headline */}
            <div className="text-center mb-14">
              <AnimatePresence>
                {trustStep >= 0 && (
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
                    className="font-extrabold tracking-tight leading-tight"
                    style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: C.green }}
                  >
                    {copy.trustH}
                  </motion.h2>
                )}
              </AnimatePresence>

              {/* 1: Subtext */}
              <AnimatePresence>
                {trustStep >= 1 && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mt-5 text-[18px] font-semibold leading-relaxed"
                    style={{ color: C.text }}
                  >
                    {copy.trustP1}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* "Every..." lines with growing vertical bar */}
            <div className="relative mb-10 ml-4">
              {/* Vertical bar grows from top */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={lineGrow ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute left-0 top-0 bottom-0 w-[4px] rounded-full origin-top"
                style={{ backgroundColor: `${C.green}55` }}
              />

              <div className="pl-6 space-y-5">
                {copy.trustLines.map((line, i) => (
                  <AnimatePresence key={i}>
                    {trustStep >= i + 2 && (
                      <motion.p
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                        className="text-[22px] leading-snug font-medium"
                        style={{ color: C.muted }}
                      >
                        {line}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>

            {/* 6: Conclusion with hand-drawn underline */}
            <div className="text-center my-10">
              <AnimatePresence>
                {trustStep >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                    className="inline-block relative"
                  >
                    <p className="text-[26px] font-extrabold" style={{ color: C.text }}>
                      {copy.trustConclusion}
                    </p>
                    {/* SVG hand-drawn underline */}
                    <svg
                      className="absolute -bottom-2 left-0 w-full overflow-visible"
                      height="8" viewBox="0 0 300 8" preserveAspectRatio="none"
                    >
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

            {/* 7: Closing */}
            <AnimatePresence>
              {trustStep >= 7 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative text-center pt-8"
                >
                  <div className="w-12 h-[3px] rounded-full mx-auto mb-6" style={{ backgroundColor: `${C.green}66` }} />
                  <p className="text-[20px] font-extrabold leading-relaxed" style={{ color: C.green }}>
                    {copy.trustClose}
                  </p>
                  {/* Floating orbs */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-8 top-0 w-[80px] h-[80px] rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: `${C.green}18` }}
                  />
                  <motion.div
                    animate={{ y: [0, 6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -left-10 bottom-0 w-[60px] h-[60px] rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: `${C.green}12` }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ════ FINAL CTA ════ */}
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center py-20">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-extrabold tracking-tight leading-[1.15]" style={{ fontSize: 'clamp(34px, 5vw, 60px)', color: C.text }}>
                {copy.ctaH1}
              </h2>
              <p className="mt-5" style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: C.muted }}>
                {copy.ctaH2}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <motion.button
                onClick={() => setActiveTab('auth_signup')}
                animate={btnNudge ? { y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' } : { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="mt-10 text-[16px] font-bold text-white px-9 py-4 rounded-2xl"
                style={{ backgroundColor: C.text }}
              >
                {copy.ctaBtn}
              </motion.button>
            </Reveal>
          </div>
        </section>

        {/* ════ FOOTER ════ */}
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
                  {['Voice & Audio', 'Documents & PDFs', 'Images & Screenshots', 'Websites & Links', 'QR Codes', 'Emails'].map((item) => (
                    <li key={item}>
                      <button onClick={() => setActiveTab('auth_signup')} className="text-[13px] font-medium hover:underline underline-offset-4" style={{ color: C.green }}>
                        {item}
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
                  onClick={() => setActiveTab('auth_signup')}
                  className="mt-5 inline-block text-[13px] font-extrabold px-5 py-2.5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                  style={{ color: C.green, borderColor: `${C.green}44`, backgroundColor: `${C.green}08` }}
                >
                  Get started free →
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

        /* Paper texture drifts very slowly */
        @keyframes noiseDrift {
          0%   { transform: translate(0px, 0px); }
          33%  { transform: translate(-6px, -4px); }
          66%  { transform: translate(4px, -7px); }
          100% { transform: translate(0px, 0px); }
        }
        .noise-drift {
          animation: noiseDrift 28s ease-in-out infinite;
          will-change: transform;
        }

        /* Newspaper clipping paper texture overlay */
        .clipping-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.04;
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>
    </>
  );
}
