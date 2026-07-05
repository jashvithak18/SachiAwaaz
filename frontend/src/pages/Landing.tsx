import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Translations ─── */
const T = {
  en: {
    heroH1: "Some lies don't look like lies.",
    heroH2: "That's what makes them dangerous.",
    heroP1: "Every day someone trusts",
    heroP2: "a fake internship,",
    heroP3: "an AI generated voice,",
    heroP4: "an edited screenshot,",
    heroP5: "or a forged document.",
    heroP6: "Not because they were careless.",
    heroP7: "Because everything looked real.",
    btnVerify: "Verify Something",
    btnStories: "See Real Stories",
    navVerify: "Verify Now",
    // Story 1
    s1Bubble: '"Papa, I\'m in trouble. Send money."',
    s1Reveal: "It sounded exactly like her.",
    s1Result: "AI Generated Voice",
    // Story 2
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
    s2Result: "Forged Document Detected",
    // Story 3
    s3Name: "Uncle Sharma",
    s3Msg1: "Did you see this? Government just announced free laptop scheme for students!",
    s3Msg2: "Forward this to everyone. Last date tomorrow!",
    s3Sent: "Is this real?",
    s3Headline: "FREE LAPTOPS FOR ALL STUDENTS — Apply Now",
    s3Flag1: "Fake watermark",
    s3Flag2: "Edited header",
    s3Flag3: "No official source",
    s3Result: "Manipulated Image",
    // Story 4
    s4Caption: "I invested just ₹500 and earned ₹5,00,000 in 3 months! Use this app now!",
    s4User: "@wealth_guru_official",
    s4Flag1: "Face manipulation detected",
    s4Flag2: "Voice pattern mismatch",
    s4Result: "Deepfake Detected",
    // Interactive
    interTitle: "What would you verify today?",
    interDrop: "Drop a file or click to upload",
    interAnalyze: "Analyzing...",
    interDone: "Verification Complete",
    tabVoice: "Voice",
    tabDoc: "Document",
    tabImage: "Image",
    tabVideo: "Video",
    // Trust
    trustH: "Built because digital trust is disappearing.",
    trustP1: "Every forwarded message,",
    trustP2: "every unknown call,",
    trustP3: "every edited document,",
    trustP4: "every AI generated voice—",
    trustP5: "deserves verification before belief.",
    trustP6: "PARAKH exists to give people confidence before they trust.",
    // CTA
    ctaH1: "Don't verify because you're suspicious.",
    ctaH2: "Verify because the internet has changed.",
    ctaBtn: "Start Verifying",
  },
  hi: {
    heroH1: "कुछ झूठ, झूठ जैसे नहीं दिखते।",
    heroH2: "यही उन्हें खतरनाक बनाता है।",
    heroP1: "हर दिन कोई भरोसा करता है",
    heroP2: "एक नकली इंटर्नशिप पर,",
    heroP3: "एक AI-जनित आवाज़ पर,",
    heroP4: "एक संपादित स्क्रीनशॉट पर,",
    heroP5: "या एक जाली दस्तावेज़ पर।",
    heroP6: "इसलिए नहीं कि वे लापरवाह थे।",
    heroP7: "क्योंकि सब कुछ असली दिख रहा था।",
    btnVerify: "कुछ परखें",
    btnStories: "असली कहानियाँ देखें",
    navVerify: "अभी परखें",
    s1Bubble: '"पापा, मैं मुसीबत में हूँ। पैसे भेजो।"',
    s1Reveal: "आवाज़ बिल्कुल उसी जैसी थी।",
    s1Result: "AI जनित आवाज़",
    s2From: "hiring@goggle-careers.co",
    s2Subject: "बधाई! आपका चयन हो गया है",
    s2Body1: "प्रिय उम्मीदवार,",
    s2Body2: "हमें आपको सूचित करते हुए खुशी हो रही है कि आपका हमारे संगठन में सॉफ्टवेयर इंजीनियरिंग इंटर्नशिप के लिए चयन हो गया है।",
    s2Body3: "वेतन: ₹45,000/माह",
    s2Body4: "कृपया संलग्न ऑफर लेटर देखें।",
    s2Attach: "Offer_Letter_2026.pdf",
    s2Flag1: "गलत डोमेन",
    s2Flag2: "नकली हस्ताक्षर",
    s2Meta: "PDF बनाया: 2 घंटे पहले · निर्माता: Canva",
    s2Result: "जाली दस्तावेज़ पाया गया",
    s3Name: "शर्मा अंकल",
    s3Msg1: "ये देखा? सरकार ने छात्रों के लिए मुफ्त लैपटॉप योजना घोषित की!",
    s3Msg2: "सबको फॉरवर्ड करो। कल आखिरी तारीख है!",
    s3Sent: "क्या ये सच है?",
    s3Headline: "सभी छात्रों के लिए मुफ्त लैपटॉप — अभी आवेदन करें",
    s3Flag1: "नकली वॉटरमार्क",
    s3Flag2: "संपादित हेडर",
    s3Flag3: "कोई आधिकारिक स्रोत नहीं",
    s3Result: "हेरफेर की गई छवि",
    s4Caption: "मैंने बस ₹500 लगाए और 3 महीने में ₹5,00,000 कमाए! अभी ये ऐप इस्तेमाल करो!",
    s4User: "@wealth_guru_official",
    s4Flag1: "चेहरे में हेरफेर पाया गया",
    s4Flag2: "आवाज़ पैटर्न मेल नहीं खाता",
    s4Result: "डीपफेक पाया गया",
    interTitle: "आज आप क्या परखना चाहेंगे?",
    interDrop: "फ़ाइल यहाँ छोड़ें या अपलोड करें",
    interAnalyze: "विश्लेषण हो रहा है...",
    interDone: "सत्यापन पूर्ण",
    tabVoice: "आवाज़",
    tabDoc: "दस्तावेज़",
    tabImage: "छवि",
    tabVideo: "वीडियो",
    trustH: "बनाया गया क्योंकि डिजिटल भरोसा गायब हो रहा है।",
    trustP1: "हर फॉरवर्ड किया गया संदेश,",
    trustP2: "हर अनजान कॉल,",
    trustP3: "हर संपादित दस्तावेज़,",
    trustP4: "हर AI जनित आवाज़—",
    trustP5: "विश्वास से पहले सत्यापन की हकदार है।",
    trustP6: "PARAKH लोगों को भरोसा करने से पहले विश्वास दिलाने के लिए मौजूद है।",
    ctaH1: "शक होने पर परखें ऐसा नहीं है।",
    ctaH2: "परखें क्योंकि इंटरनेट बदल गया है।",
    ctaBtn: "परखना शुरू करें",
  },
};

const LOADING_LINES = [
  "हर आवाज़ सच नहीं होती",
  "हर दस्तावेज़ असली नहीं होता",
  "हर तस्वीर भरोसेमंद नहीं होती",
  "सत्य की जाँच की जा रही है…",
];

/* ─── Fade-in wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Story reveal hook ─── */
function useStoryReveal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-200px' });
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (inView && !revealed) {
      const timer = setTimeout(() => setRevealed(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [inView, revealed]);
  return { ref, revealed, inView };
}

/* ─── Phone Frame ─── */
function PhoneFrame({ children, glitch = false }: { children: React.ReactNode; glitch?: boolean }) {
  return (
    <div className={`relative mx-auto w-[280px] rounded-[36px] bg-[#181818] p-[10px] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)] ${glitch ? 'animate-[glitch_0.3s_ease-in-out_3]' : ''}`}>
      {/* Notch */}
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[80px] h-[24px] bg-[#181818] rounded-b-2xl z-10" />
      <div className="rounded-[28px] overflow-hidden bg-[#111]">
        {children}
      </div>
    </div>
  );
}

/* ─── Waveform bars (CSS) ─── */
function WaveformBars({ error = false }: { error?: boolean }) {
  const heights = [12, 20, 8, 24, 14, 18, 10, 22, 16, 6, 20, 12, 18, 8, 14];
  return (
    <div className="flex items-end gap-[2px] h-[28px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-500 ${error ? 'bg-[#A1493F]' : 'bg-[#3E5C4B]'}`}
          style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }}
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
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-6 inline-flex items-center gap-3 border border-[#A1493F]/30 bg-[#A1493F]/5 px-5 py-3 rounded-xl"
        >
          <div className="w-2 h-2 rounded-full bg-[#A1493F]" />
          <span className="text-[15px] font-semibold text-[#A1493F] tracking-tight">{text}</span>
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
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay }}
          className="inline-block text-[11px] font-semibold text-[#A1493F] bg-[#A1493F]/8 border border-[#A1493F]/20 px-2.5 py-1 rounded-md"
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */

export default function Landing() {
  const { setActiveTab } = useStore();
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = T[lang];

  /* Loading screen */
  const [loading, setLoading] = useState(true);
  const [loadLineIdx, setLoadLineIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadLineIdx((prev) => {
        if (prev >= LOADING_LINES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  /* Nav scroll */
  const [showNav, setShowNav] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowNav(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Story hooks */
  const story1 = useStoryReveal();
  const story2 = useStoryReveal();
  const story3 = useStoryReveal();
  const story4 = useStoryReveal();

  /* Interactive demo */
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

  const scrollToStories = () => {
    document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ─── LOADING SCREEN ─── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: '#F6F4EF' }}
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-[40px] font-extrabold tracking-tight text-[#181818]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              PARAKH
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[14px] text-[#666] mt-1"
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            >
              सच की पहचान
            </motion.p>
            <div className="mt-8 h-[24px] relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadLineIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
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
        style={{
          backgroundColor: '#F6F4EF',
          color: '#181818',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Subtle paper texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ─── FIXED NAV (on scroll) ─── */}
        <AnimatePresence>
          {showNav && (
            <motion.header
              initial={{ y: -64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -64, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
              style={{
                backgroundColor: 'rgba(246, 244, 239, 0.85)',
                borderColor: '#E4E1DA',
              }}
            >
              <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
                <div>
                  <span className="text-[15px] font-bold tracking-tight text-[#181818]">PARAKH</span>
                  <span className="text-[10px] text-[#666] ml-2" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>सच की पहचान</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                    className="text-[13px] text-[#666] hover:text-[#181818] transition-colors"
                  >
                    {lang === 'en' ? 'हिन्दी' : 'English'}
                  </button>
                  <button
                    onClick={() => setActiveTab('auth_signup')}
                    className="text-[13px] font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: '#181818' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3E5C4B')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
                  >
                    {t.navVerify}
                  </button>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ─── HERO ─── */}
        <section className="relative z-10 min-h-screen flex flex-col">
          {/* Top bar (inline, not fixed) */}
          <div className="max-w-[1080px] w-full mx-auto px-6 pt-8 flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-[#181818]">PARAKH</h2>
              <p className="text-[11px] text-[#3E5C4B] -mt-0.5" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>सच की पहचान</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="text-[13px] text-[#666] hover:text-[#181818] transition-colors"
              >
                {lang === 'en' ? 'English' : 'English'} | {lang === 'en' ? 'हिन्दी' : 'हिन्दी'}
              </button>
              <button
                onClick={() => setActiveTab('auth_signup')}
                className="text-[13px] font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#181818' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3E5C4B')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
              >
                {t.navVerify}
              </button>
            </div>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex items-center">
            <div className="max-w-[1080px] mx-auto px-6 py-20">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={!loading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-extrabold tracking-tight leading-[1.05] text-[#181818]"
                style={{ fontSize: 'clamp(40px, 6vw, 82px)' }}
              >
                {t.heroH1}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={!loading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-4 text-[#666] font-normal"
                style={{ fontSize: 'clamp(22px, 3vw, 36px)' }}
              >
                {t.heroH2}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={!loading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-10 max-w-[520px] text-[#666] leading-[1.8]"
                style={{ fontSize: '18px' }}
              >
                <p>{t.heroP1}</p>
                <p>{t.heroP2}</p>
                <p>{t.heroP3}</p>
                <p>{t.heroP4}</p>
                <p>{t.heroP5}</p>
                <p className="mt-6 text-[#181818] font-medium">{t.heroP6}</p>
                <p className="text-[#181818] font-medium">{t.heroP7}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={!loading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-10 flex items-center gap-6"
              >
                <button
                  onClick={() => setActiveTab('auth_signup')}
                  className="text-[15px] font-semibold text-white px-7 py-3.5 rounded-xl transition-colors"
                  style={{ backgroundColor: '#181818' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3E5C4B')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
                >
                  {t.btnVerify}
                </button>
                <button
                  onClick={scrollToStories}
                  className="text-[15px] text-[#666] hover:text-[#181818] transition-colors"
                >
                  ↓ {t.btnStories}
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STORY 1 — Voice Clone (Phone Call)
            ════════════════════════════════════════════ */}
        <section id="stories" className="relative z-10 min-h-screen flex items-center justify-center py-24" ref={story1.ref}>
          <div className="max-w-[1080px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            {/* Phone */}
            <div className="flex-shrink-0">
              <PhoneFrame glitch={story1.revealed}>
                <div className="h-[480px] flex flex-col items-center justify-between py-12" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
                  {/* Caller info */}
                  <div className="text-center">
                    <div className="w-[72px] h-[72px] rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-[28px] font-bold text-white/80">D</span>
                    </div>
                    <p className="text-white text-[28px] font-semibold">Dad</p>
                    <p className="text-white/50 text-[13px] mt-1">Incoming call...</p>
                  </div>
                  {/* Call buttons */}
                  <div className="flex items-center gap-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-[56px] h-[56px] rounded-full bg-[#A1493F] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </div>
                      <span className="text-white/50 text-[11px]">Decline</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-[56px] h-[56px] rounded-full bg-[#3E5C4B] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </div>
                      <span className="text-white/50 text-[11px]">Accept</span>
                    </div>
                  </div>
                </div>
              </PhoneFrame>
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={story1.inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 text-center"
              >
                <div className="inline-block bg-[#FBFAF8] border border-[#E4E1DA] rounded-2xl px-5 py-3 text-[15px] text-[#181818] italic shadow-sm">
                  {t.s1Bubble}
                </div>
              </motion.div>
            </div>

            {/* Text side */}
            <div className="max-w-[440px]">
              <Reveal>
                <AnimatePresence>
                  {story1.revealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-6"
                    >
                      <p className="text-[28px] font-semibold leading-tight text-[#181818]">
                        {t.s1Reveal}
                      </p>
                      <div className="flex items-center gap-4">
                        <WaveformBars error />
                        <span className="text-[13px] text-[#666]">0:18</span>
                      </div>
                      <ResultBadge text={t.s1Result} visible />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!story1.revealed && story1.inView && (
                  <div className="flex items-center gap-3 text-[#666] text-[14px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3E5C4B] animate-pulse" />
                    Scroll to reveal...
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STORY 2 — Fake Document (Email)
            ════════════════════════════════════════════ */}
        <section className="relative z-10 min-h-screen flex items-center justify-center py-24" ref={story2.ref}>
          <div className="max-w-[1080px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            {/* Email UI */}
            <div className="flex-shrink-0 w-full max-w-[520px]">
              <div className="bg-white rounded-xl border border-[#E4E1DA] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E4E1DA] bg-[#FBFAF8]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#A1493F]/60" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#C4A24E]/60" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#3E5C4B]/60" />
                  <span className="ml-3 text-[12px] text-[#666]">Mail</span>
                </div>
                {/* Email header */}
                <div className="px-6 py-4 border-b border-[#E4E1DA]/60">
                  <p className="text-[13px] text-[#666]">
                    From: <span className={`font-medium ${story2.revealed ? 'text-[#A1493F] underline decoration-wavy decoration-[#A1493F]/50' : 'text-[#181818]'}`}>{t.s2From}</span>
                    {story2.revealed && <FlagLabel text={t.s2Flag1} visible delay={0.2} />}
                  </p>
                  <p className="text-[15px] font-semibold text-[#181818] mt-1">{t.s2Subject}</p>
                </div>
                {/* Email body */}
                <div className="px-6 py-5 space-y-3 text-[14px] text-[#181818] leading-relaxed">
                  <p>{t.s2Body1}</p>
                  <p className="text-[#666]">{t.s2Body2}</p>
                  <p className="font-semibold">{t.s2Body3}</p>
                  <p className="text-[#666]">{t.s2Body4}</p>
                  {/* Attachment */}
                  <div className="flex items-center gap-3 mt-4 p-3 bg-[#F6F4EF] rounded-lg border border-[#E4E1DA]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="text-[13px] text-[#666]">{t.s2Attach}</span>
                  </div>
                  {/* Signature area */}
                  <div className={`mt-4 pt-4 border-t border-[#E4E1DA]/60 ${story2.revealed ? 'bg-[#A1493F]/5 -mx-6 px-6 py-3 border border-[#A1493F]/20 rounded-lg relative' : ''}`}>
                    <p className="text-[13px] text-[#666]">Best regards,</p>
                    <p className="text-[14px] font-medium text-[#181818] italic mt-1">Ravi Mehta</p>
                    <p className="text-[12px] text-[#666]">Talent Acquisition Lead</p>
                    {story2.revealed && (
                      <div className="absolute top-2 right-3">
                        <FlagLabel text={t.s2Flag2} visible delay={0.4} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Metadata reveal */}
                <AnimatePresence>
                  {story2.revealed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      className="px-6 py-3 bg-[#A1493F]/5 border-t border-[#A1493F]/20 text-[12px] text-[#A1493F] font-medium"
                    >
                      {t.s2Meta}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Result side */}
            <div className="max-w-[400px]">
              <Reveal>
                <ResultBadge text={t.s2Result} visible={story2.revealed} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STORY 3 — Manipulated Image (WhatsApp)
            ════════════════════════════════════════════ */}
        <section className="relative z-10 min-h-screen flex items-center justify-center py-24" ref={story3.ref}>
          <div className="max-w-[1080px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            {/* WhatsApp Chat */}
            <div className="flex-shrink-0 w-full max-w-[380px]">
              <div className="rounded-xl overflow-hidden border border-[#E4E1DA] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)]">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: '#1F4539' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  <div className="w-[32px] h-[32px] rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-[13px] font-semibold">S</span>
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-semibold">{t.s3Name}</p>
                    <p className="text-white/60 text-[11px]">online</p>
                  </div>
                </div>
                {/* Chat body */}
                <div className="p-4 space-y-3" style={{ backgroundColor: '#ECE5DD' }}>
                  {/* Received */}
                  <div className="max-w-[85%]">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 text-[13px] text-[#181818] shadow-sm">
                      {t.s3Msg1}
                    </div>
                  </div>
                  {/* Fake news image */}
                  <div className="max-w-[85%] relative">
                    <div className={`bg-white rounded-xl rounded-tl-sm overflow-hidden shadow-sm relative ${story3.revealed ? 'ring-2 ring-[#A1493F]/40' : ''}`}>
                      <div className="bg-[#1a3a5c] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-[20px] h-[20px] rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/80 font-semibold">GOVT. NEWS</span>
                        </div>
                      </div>
                      <div className="px-3 py-3 bg-white">
                        <p className="text-[12px] font-bold text-[#181818] leading-tight">{t.s3Headline}</p>
                        <p className="text-[10px] text-[#666] mt-1">governmentnews.co.in</p>
                      </div>
                      {/* Scan overlay */}
                      {story3.revealed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(161,73,63,0.08) 4px, rgba(161,73,63,0.08) 5px)',
                          }}
                        />
                      )}
                    </div>
                    {/* Flags */}
                    {story3.revealed && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <FlagLabel text={t.s3Flag1} visible delay={0.1} />
                        <FlagLabel text={t.s3Flag2} visible delay={0.3} />
                        <FlagLabel text={t.s3Flag3} visible delay={0.5} />
                      </div>
                    )}
                  </div>
                  {/* Received */}
                  <div className="max-w-[85%]">
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 text-[13px] text-[#181818] shadow-sm">
                      {t.s3Msg2}
                    </div>
                  </div>
                  {/* Sent */}
                  <div className="max-w-[75%] ml-auto">
                    <div className="rounded-xl rounded-tr-sm px-3 py-2 text-[13px] text-[#181818] shadow-sm" style={{ backgroundColor: '#DCF8C6' }}>
                      {t.s3Sent}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="max-w-[400px]">
              <Reveal>
                <ResultBadge text={t.s3Result} visible={story3.revealed} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STORY 4 — Deepfake (Instagram Reel)
            ════════════════════════════════════════════ */}
        <section className="relative z-10 min-h-screen flex items-center justify-center py-24" ref={story4.ref}>
          <div className="max-w-[1080px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            {/* Reel phone */}
            <div className="flex-shrink-0">
              <PhoneFrame glitch={story4.revealed}>
                <div className="h-[480px] relative flex flex-col justify-end" style={{ backgroundColor: '#111' }}>
                  {/* Person silhouette */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[100px] h-[100px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  </div>
                  {/* Side icons */}
                  <div className="absolute right-3 bottom-[120px] flex flex-col items-center gap-5">
                    <div className="flex flex-col items-center gap-1">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      <span className="text-white text-[10px]">4.2L</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span className="text-white text-[10px]">892</span>
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </div>
                  {/* Caption area */}
                  <div className="p-4 pb-6 relative z-10" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <p className="text-white font-semibold text-[13px] mb-1">{t.s4User}</p>
                    <p className="text-white/80 text-[12px] leading-relaxed">{t.s4Caption}</p>
                  </div>
                  {/* Scan lines overlay */}
                  {story4.revealed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(161,73,63,0.1) 3px, rgba(161,73,63,0.1) 4px)',
                      }}
                    />
                  )}
                </div>
              </PhoneFrame>
            </div>

            {/* Result side */}
            <div className="max-w-[440px]">
              <Reveal>
                <AnimatePresence>
                  {story4.revealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <FlagLabel text={t.s4Flag1} visible delay={0.1} />
                        <br />
                        <FlagLabel text={t.s4Flag2} visible delay={0.3} />
                      </div>
                      <ResultBadge text={t.s4Result} visible />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            INTERACTIVE VERIFICATION
            ════════════════════════════════════════════ */}
        <section className="relative z-10 py-32">
          <div className="max-w-[640px] mx-auto px-6">
            <Reveal>
              <h2 className="text-center font-bold tracking-tight text-[#181818] mb-12" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
                {t.interTitle}
              </h2>
            </Reveal>

            <Reveal delay={0.15}>
              {/* Tabs */}
              <div className="flex justify-center gap-1 mb-8">
                {['voice', 'doc', 'image', 'video'].map((tab) => {
                  const labels: Record<string, string> = { voice: t.tabVoice, doc: t.tabDoc, image: t.tabImage, video: t.tabVideo };
                  return (
                    <button
                      key={tab}
                      onClick={() => { setTab(tab); setDemoState('idle'); setProgress(0); }}
                      className="px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all"
                      style={{
                        backgroundColor: activeTab === tab ? '#181818' : 'transparent',
                        color: activeTab === tab ? '#fff' : '#666',
                        border: activeTab === tab ? 'none' : '1px solid #E4E1DA',
                      }}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Drop zone */}
              <div className="bg-[#FBFAF8] border border-[#E4E1DA] rounded-2xl p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
                {demoState === 'idle' && (
                  <div
                    onClick={startDemo}
                    className="border-2 border-dashed border-[#E4E1DA] hover:border-[#3E5C4B] rounded-xl p-12 text-center cursor-pointer transition-colors"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" className="mx-auto mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p className="text-[15px] text-[#666]">{t.interDrop}</p>
                  </div>
                )}

                {demoState === 'progress' && (
                  <div className="py-8 text-center space-y-5">
                    <p className="text-[15px] text-[#666] font-medium">{t.interAnalyze}</p>
                    <div className="w-full h-[4px] bg-[#E4E1DA] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#3E5C4B', width: `${progress}%` }}
                        transition={{ ease: 'linear' }}
                      />
                    </div>
                  </div>
                )}

                {demoState === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="py-8 text-center space-y-4"
                  >
                    <div className="w-[48px] h-[48px] rounded-full bg-[#3E5C4B]/10 flex items-center justify-center mx-auto">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E5C4B" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[18px] font-semibold text-[#3E5C4B]">{t.interDone}</p>
                    <button
                      onClick={() => setActiveTab('auth_signup')}
                      className="text-[13px] text-[#666] hover:text-[#181818] underline underline-offset-4 transition-colors"
                    >
                      {lang === 'en' ? 'Sign up for full reports' : 'पूरी रिपोर्ट के लिए साइन अप करें'}
                    </button>
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TRUST SECTION
            ════════════════════════════════════════════ */}
        <section className="relative z-10 py-32">
          <div className="max-w-[640px] mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-bold tracking-tight text-[#181818] mb-10" style={{ fontSize: 'clamp(26px, 3.5vw, 38px)' }}>
                {t.trustH}
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="text-[#666] leading-[2.2] space-y-0" style={{ fontSize: '18px' }}>
                <p>{t.trustP1}</p>
                <p>{t.trustP2}</p>
                <p>{t.trustP3}</p>
                <p>{t.trustP4}</p>
                <p className="mt-8 text-[#181818] font-medium">{t.trustP5}</p>
                <p className="mt-4 text-[#181818] font-medium">{t.trustP6}</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FINAL CTA
            ════════════════════════════════════════════ */}
        <section className="relative z-10 min-h-[80vh] flex items-center justify-center">
          <div className="max-w-[720px] mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-bold tracking-tight text-[#181818] leading-[1.15]" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
                {t.ctaH1}
              </h2>
              <p className="mt-4 text-[#666]" style={{ fontSize: 'clamp(20px, 3vw, 28px)' }}>
                {t.ctaH2}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <button
                onClick={() => setActiveTab('auth_signup')}
                className="mt-10 text-[16px] font-semibold text-white px-8 py-4 rounded-xl transition-colors"
                style={{ backgroundColor: '#181818' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3E5C4B')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
              >
                {t.ctaBtn}
              </button>
            </Reveal>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="relative z-10 py-12 text-center border-t border-[#E4E1DA]">
          <p className="text-[14px] text-[#666]">
            PARAKH <span style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>· सच की पहचान</span>
          </p>
          <p className="text-[12px] text-[#666]/60 mt-2">
            Privacy · Terms · Contact
          </p>
        </footer>
      </div>

      {/* ─── GLITCH KEYFRAMES ─── */}
      <style>{`
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
