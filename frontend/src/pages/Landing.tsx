import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS = {
  en: {
    heroTitle: "We know why you believed it.",
    heroSub1: "Because it looked real.",
    heroSub2: "Not because you were careless.",
    heroParagraph: "Every day people receive fake internship offers, edited payment screenshots, cloned voices, forged documents and fake QR codes. Nobody expects them to be fake.",
    verifyNow: "Verify Now",
    watchCase: "Watch a Real Case",
    logoTagline: "परख सच की, भरोसा अपने निर्णयों का।",
    scrollExplore: "Scroll to explore the evidence",
    
    // Story 1
    s1Title: "You finally got selected.",
    s1Company: "The company looked real.",
    s1Website: "The website existed.",
    s1Sig: "The signature matched.",
    s1AlteredSig: "Forged Signature",
    s1Watermark: "Unverified Copy",
    s1Verdict: "It was fake.",

    // Story 2
    s2Title: "It wasn't edited well enough.",
    s2Amount: "₹24,500 Sent",
    s2Receipt: "Payment successful. The transaction matched.",
    s2WarningTime: "Altered Timestamp (+5h offset)",
    s2WarningFont: "Non-standard font layout",

    // Story 3
    s3Title: "It sounded exactly like your daughter.",
    s3Verdict: "But it wasn't.",
    s3WarningVoice: "AI Synthesized Vocoder Artifacts Detected",

    // Story 5 (Aadhaar/Medical)
    s4Title: "Everything looks authentic.",
    s4Doc: "Hospital Report",
    s4WarningDoc: "Unauthorized Doctor Signature Hash",
    
    // Emotional Pivot
    pivot1: "You weren't careless.",
    pivot2: "You were human.",
    pivot3: "That's exactly why PARAKH exists.",
    
    // Introduce product
    verifyTitle: "What can you verify?",
    voice: "Voice",
    image: "Image",
    video: "Video",
    document: "Document",
    qr: "QR Code",
    identity: "Identity",
    
    voiceDesc: "Inspect biometric vocal waveforms and isolate cloned synthetic voice prints.",
    imageDesc: "Audits compression quantization levels and hidden EXIF metadata editors.",
    videoDesc: "Analyzes face-swaps, frame anomalies, and lip-sync vocal matching.",
    documentDesc: "Scans PDF layers, creator signatures, and structural tampering markers.",
    qrDesc: "Resolves short URL links and flags unverified private target addresses.",
    identityDesc: "Authenticates government document layouts and validates digital seals.",
    
    finalTitle: "If something feels off...",
    finalSub: "Check before you believe.",
    finalButton: "Start Verifying",
    
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerContact: "Contact Support"
  },
  hi: {
    heroTitle: "हम जानते हैं कि आपने विश्वास क्यों किया।",
    heroSub1: "क्योंकि वह बिल्कुल असली लग रहा था।",
    heroSub2: "इसलिए नहीं कि आप लापरवाह थे।",
    heroParagraph: "हर दिन लोगों को नकली इंटर्नशिप ऑफर, संपादित भुगतान स्क्रीनशॉट, क्लोन की गई आवाजें, जाली दस्तावेज और नकली क्यूआर कोड मिलते हैं। कोई नहीं उम्मीद करता कि वे नकली होंगे।",
    verifyNow: "अभी परखें",
    watchCase: "वास्तविक मामला देखें",
    logoTagline: "परख सच की, भरोसा अपने निर्णयों का।",
    scrollExplore: "सबूतों की जांच करने के लिए स्क्रॉल करें",
    
    // Story 1
    s1Title: "आपका आखिरकार चयन हो गया।",
    s1Company: "कंपनी असली लग रही थी।",
    s1Website: "वेबसाइट मौजूद थी।",
    s1Sig: "हस्ताक्षर मेल खा रहे थे।",
    s1AlteredSig: "जाली हस्ताक्षर",
    s1Watermark: "अपुष्ट प्रति",
    s1Verdict: "यह नकली था।",

    // Story 2
    s2Title: "यह ठीक से संपादित नहीं किया गया था।",
    s2Amount: "₹24,500 भेजा गया",
    s2Receipt: "भुगतान सफल रहा। लेन-देन का मिलान हो गया था।",
    s2WarningTime: "संपादित टाइमस्टैम्प (+5 घंटे का अंतर)",
    s2WarningFont: "गैर-मानक फ़ॉन्ट लेआउट",

    // Story 3
    s3Title: "यह बिल्कुल आपकी बेटी की आवाज़ की तरह लग रहा था।",
    s3Verdict: "लेकिन वह नहीं थी।",
    s3WarningVoice: "एआई सिंथेटिक वोकोडर आर्टिफैक्ट्स पाए गए",

    // Story 4
    s4Title: "सब कुछ असली लग रहा था।",
    s4Doc: "अस्पताल की रिपोर्ट",
    s4WarningDoc: "अनधिकृत डॉक्टर हस्ताक्षर हैश",

    // Emotional Pivot
    pivot1: "आप लापरवाह नहीं थे।",
    pivot2: "आप इंसान थे।",
    pivot3: "इसीलिए परख (PARAKH) अस्तित्व में है।",
    
    // Introduce product
    verifyTitle: "आप क्या सत्यापित कर सकते हैं?",
    voice: "आवाज़",
    image: "छवि",
    video: "वीडियो",
    document: "दस्तावेज़",
    qr: "क्यूआर कोड",
    identity: "पहचान",
    
    voiceDesc: "बायोमेट्रिक स्वर तरंगों की जांच करें और क्लोन किए गए सिंथेटिक वॉयस प्रिंट को अलग करें।",
    imageDesc: "कंप्रेशन क्वांटाइजेशन स्तर और छिपे हुए मेटाडेटा संपादकों का ऑडिट करता है।",
    videoDesc: "फेस-स्वैप, फ्रेम विसंगतियों और लिप-सिंक वॉयस मिलान का विश्लेषण करता है।",
    documentDesc: "पीडीएफ परतों, लेखक के हस्ताक्षरों और संरचनात्मक हेरफेर के निशानों को स्कैन करता है।",
    qrDesc: "लघु यूआरएल लिंक को हल करता है और असत्यापित निजी लक्ष्य पतों को फ़्लैग करता है।",
    identityDesc: "सरकारी दस्तावेज़ लेआउट को प्रमाणित करता है और डिजिटल मुहरों की पुष्टि करता है।",
    
    finalTitle: "अगर कुछ अजीब लगता है...",
    finalSub: "विश्वास करने से पहले जांचें।",
    finalButton: "परखना शुरू करें",
    
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerContact: "सहायता केंद्र"
  }
};

export default function Landing() {
  const { setActiveTab } = useStore();
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  // Navigation show on scroll state
  const [showNav, setShowNav] = useState(false);
  
  // Parallax mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Story state steps
  const [story1Step, setStory1Step] = useState(0);
  const [story2Step, setStory2Step] = useState(0);
  const [story3Step, setStory3Step] = useState(0);
  const [story4Step, setStory4Step] = useState(0);

  // Upload Sandbox demo states
  const [sandboxState, setSandboxState] = useState<'idle' | 'uploading' | 'analyzing' | 'verifying' | 'generating' | 'done'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cycle highlights on hero cards
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX - innerWidth / 2) / 40,
      y: (clientY - innerHeight / 2) / 40
    });
  };

  const startSandboxDemo = () => {
    setSandboxState('uploading');
    setTimeout(() => {
      setSandboxState('analyzing');
      setTimeout(() => {
        setSandboxState('verifying');
        setTimeout(() => {
          setSandboxState('generating');
          setTimeout(() => {
            setSandboxState('done');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen selection:bg-[#B45309]/15 overflow-x-hidden antialiased text-[#171717] relative font-sans"
      style={{ backgroundColor: '#F6F3EE' }}
    >
      
      {/* Dynamic Glass Morphism Navigation (Revealed after scroll) */}
      <AnimatePresence>
        {showNav && (
          <motion.header 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="border-b border-[#E5DED5]/40 fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#F6F3EE]/80 py-4 shadow-sm"
          >
            <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-xs font-semibold">
              <div className="flex items-center space-x-6">
                <span className="font-semibold text-sm tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  PARAKH
                </span>
                <span className="text-[10px] text-[#556B2F] font-devanagari hidden sm:inline">{t.logoTagline}</span>
              </div>
              <div className="flex items-center space-x-6">
                <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="hover:text-[#B45309] font-devanagari">
                  {lang === 'en' ? 'हिन्दी' : 'English'}
                </button>
                <button 
                  onClick={() => setActiveTab('auth_signup')}
                  className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-xl transition"
                >
                  {t.verifyNow}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Hero Section (No Top Header menu, Logo Only) */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-24 min-h-[95vh] flex flex-col justify-between">
        {/* Top Logo area */}
        <div className="flex justify-between items-center py-4 border-b border-[#E5DED5]/30">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">PARAKH</h1>
            <p className="text-[10px] text-[#B45309] font-devanagari leading-none font-semibold">{t.logoTagline}</p>
          </div>
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} 
            className="text-xs font-bold text-[#5F5F5F] hover:text-[#171717] font-devanagari"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>

        {/* Core Hero Content split screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto pt-8">
          
          {/* Left Column */}
          <div className="space-y-8 text-left">
            <div className="space-y-3">
              <h2 className="text-5xl sm:text-6xl font-light text-[#171717] tracking-tight leading-[1.08] font-devanagari">
                {t.heroTitle}
              </h2>
              <div className="space-y-1 text-lg font-normal text-[#5F5F5F] font-devanagari">
                <p>{t.heroSub1}</p>
                <p>{t.heroSub2}</p>
              </div>
            </div>
            
            <p className="text-sm text-[#5F5F5F] leading-relaxed max-w-md font-devanagari font-light">
              {t.heroParagraph}
            </p>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('auth_signup')}
                className="bg-[#171717] hover:bg-[#2A2A2A] text-white font-bold py-3.5 px-8 rounded-xl transition text-xs shadow-sm min-h-[44px]"
              >
                {t.verifyNow}
              </button>
              <a 
                href="#stories"
                className="border border-[#E5DED5] hover:bg-white text-[#5F5F5F] hover:text-[#171717] font-semibold py-3.5 px-8 rounded-xl transition text-xs text-center min-h-[44px] block"
              >
                {t.watchCase}
              </a>
            </div>
          </div>

          {/* Right Column: Subtle overlapping stacked evidence with depth parallax */}
          <div className="relative h-[360px] w-full flex items-center justify-center select-none pointer-events-none">
            
            {/* Card 1: Internship Offer letter */}
            <div 
              className={`absolute top-[5%] left-[5%] bg-white border p-4 rounded-xl shadow-lg w-48 transition-all duration-300 z-10 ${
                highlightIndex === 0 ? 'border-[#B45309] ring-1 ring-[#B45309]/30 scale-[1.02]' : 'border-[#E5DED5]'
              }`}
              style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px) rotate(-4deg)` }}
            >
              <p className="text-[6px] text-brand-400 font-bold uppercase">OFFER LETTER</p>
              <p className="text-[10px] font-bold text-[#171717] mt-1">Internship Selection</p>
              <div className="h-0.5 bg-brand-100 rounded w-full mt-2"></div>
              <div className="h-0.5 bg-brand-100 rounded w-4/5 mt-1"></div>
            </div>

            {/* Card 2: Receipt screen */}
            <div 
              className={`absolute top-[35%] right-[5%] bg-white border p-4 rounded-xl shadow-md w-44 transition-all duration-300 z-20 ${
                highlightIndex === 1 ? 'border-[#B45309] ring-1 ring-[#B45309]/30 scale-[1.02]' : 'border-[#E5DED5]'
              }`}
              style={{ transform: `translate(${mousePos.x * 0.7}px, ${mousePos.y * -0.7}px) rotate(3deg)` }}
            >
              <p className="text-[7px] text-[#5F5F5F] font-bold uppercase">Payment Receipt</p>
              <p className="text-sm font-black text-[#171717] mt-1">₹24,500</p>
              <p className="text-[8px] text-[#5F5F5F]">Sent to Rohan Sharma</p>
            </div>

            {/* Card 3: Waveform Note */}
            <div 
              className={`absolute bottom-[10%] left-[10%] bg-white border p-3.5 rounded-xl shadow-md w-48 transition-all duration-300 z-35 flex items-center space-x-2 ${
                highlightIndex === 2 ? 'border-[#B45309] ring-1 ring-[#B45309]/30 scale-[1.02]' : 'border-[#E5DED5]'
              }`}
              style={{ transform: `translate(${mousePos.x * -0.8}px, ${mousePos.y * 0.8}px) rotate(-1deg)` }}
            >
              <span className="text-[9px]">▶</span>
              <div className="flex-grow flex items-center space-x-0.5">
                <div className="w-0.5 h-3 bg-brand-300"></div>
                <div className="w-0.5 h-5 bg-[#B45309]"></div>
                <div className="w-0.5 h-2 bg-brand-200"></div>
              </div>
            </div>

            {/* Card 4: Aadhaar card mock */}
            <div 
              className={`absolute bottom-[20%] right-[10%] bg-white border p-4 rounded-xl shadow-lg w-44 transition-all duration-300 z-30 ${
                highlightIndex === 3 ? 'border-[#B45309] ring-1 ring-[#B45309]/30 scale-[1.02]' : 'border-[#E5DED5]'
              }`}
              style={{ transform: `translate(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px) rotate(-3deg)` }}
            >
              <p className="text-[6px] text-brand-400 font-bold uppercase">GOVT CARD</p>
              <p className="text-[9px] font-bold text-brand-850 mt-1">Aadhaar Mock ID</p>
            </div>

            {/* Card 5: Hospital report */}
            <div 
              className={`absolute top-[15%] left-[45%] bg-white border p-4 rounded-xl shadow-md w-44 transition-all duration-300 z-15 ${
                highlightIndex === 4 ? 'border-[#B45309] ring-1 ring-[#B45309]/30 scale-[1.02]' : 'border-[#E5DED5]'
              }`}
              style={{ transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * 0.4}px) rotate(1deg)` }}
            >
              <p className="text-[6px] text-brand-400 font-bold uppercase">MEDICAL REPORT</p>
              <div className="h-0.5 bg-brand-100 rounded w-full mt-1.5"></div>
            </div>

            {/* Card 6: QR Code */}
            <div 
              className={`absolute bottom-[2%] left-[40%] bg-white border p-3 rounded-xl shadow-md w-20 transition-all duration-300 z-40 ${
                highlightIndex === 5 ? 'border-[#B45309] ring-1 ring-[#B45309]/30 scale-[1.02]' : 'border-[#E5DED5]'
              }`}
              style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * -0.5}px) rotate(5deg)` }}
            >
              <div className="w-12 h-12 bg-[#171717] rounded flex items-center justify-center text-white text-[8px] font-mono">QR</div>
            </div>

          </div>
        </div>

        {/* Scroll exploration warning text */}
        <div className="text-center pb-4 text-[#5F5F5F] text-[10px] uppercase tracking-wider font-devanagari">
          {t.scrollExplore}
        </div>
      </section>

      {/* Section 2: Real Stories interactive checklist */}
      <section id="stories" className="max-w-4xl mx-auto px-6 py-20 space-y-24">
        
        {/* Story One: Internship offer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#E5DED5] pt-16">
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-[#B45309]">CASE STUDY 01</span>
            <h3 className="text-3xl font-normal text-[#171717] font-devanagari">{t.s1Title}</h3>
            <div className="space-y-2 text-[#5F5F5F] text-sm font-devanagari font-light">
              <p>{t.s1Company}</p>
              <p>{t.s1Website}</p>
              <p>{t.s1Sig}</p>
            </div>
            
            <button 
              type="button"
              onClick={() => setStory1Step((prev) => (prev + 1) % 2)}
              className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-xl text-xs transition"
            >
              {story1Step === 0 ? "Reveal Forensic Check" : "Reset Case"}
            </button>
          </div>

          <div className="bg-white border border-[#E5DED5] p-6 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
            {story1Step === 1 && (
              <div className="absolute top-2 right-2 bg-red-100 border border-red-200 text-red-700 px-3 py-1 rounded-xl text-[9px] font-bold uppercase animate-pulse">
                {t.s1AlteredSig}
              </div>
            )}
            <div className="flex justify-between items-center text-[9px] text-[#5F5F5F]">
              <span className="font-bold">BrandCorp</span>
              <span>10 June 2026</span>
            </div>
            <h4 className="font-bold text-xs text-[#171717] text-center uppercase tracking-wider">OFFER LETTER</h4>
            
            <div className="space-y-2 py-2">
              <div className="h-1.5 bg-brand-100 rounded w-full"></div>
              <div className="h-1.5 bg-brand-100 rounded w-5/6"></div>
              <div className="h-1.5 bg-brand-100 rounded w-4/6"></div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-brand-100 text-xs">
              <span className={`font-mono transition-colors duration-300 ${story1Step === 1 ? 'text-accent-red font-bold underline decoration-wavy' : 'text-brand-800'}`}>
                Robert Shaw
              </span>
              <span className="text-[10px] text-brand-400">HR Manager</span>
            </div>

            {story1Step === 1 && (
              <div className="text-center pt-4 text-xs font-black text-[#B45309] border-t border-[#E5DED5] animate-fade-in font-devanagari">
                {t.s1Verdict}
              </div>
            )}
          </div>
        </div>

        {/* Story Two: Payment Receipt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#E5DED5] pt-16">
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-[#B45309]">CASE STUDY 02</span>
            <h3 className="text-3xl font-normal text-[#171717] font-devanagari">{t.s2Title}</h3>
            <p className="text-sm text-[#5F5F5F] font-devanagari font-light">{t.s2Receipt}</p>
            
            <button 
              type="button"
              onClick={() => setStory2Step((prev) => (prev + 1) % 2)}
              className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-xl text-xs transition"
            >
              {story2Step === 0 ? "Inspect Pixel Layers" : "Reset Case"}
            </button>
          </div>

          <div className="bg-white border border-[#E5DED5] p-6 rounded-3xl shadow-sm space-y-4 relative">
            <div className="flex justify-between items-center text-[10px] text-brand-500 uppercase tracking-widest">
              <span>Payment Received</span>
              <span className="text-green-600">✓</span>
            </div>
            
            <div className="py-2 space-y-1">
              <span className="text-2xl font-black text-brand-800">{t.s2Amount}</span>
              <p className="text-[10px] text-brand-550">From Rohan Sharma</p>
            </div>

            <div className="space-y-2 border-t border-brand-100 pt-3">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-[#5F5F5F]">Timestamp:</span>
                <span className={`font-mono transition-colors ${story2Step === 1 ? 'text-accent-red font-bold' : 'text-[#171717]'}`}>
                  13 May 2026, 11:42 AM
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-[#5F5F5F]">Font Signature:</span>
                <span className={`font-mono transition-colors ${story2Step === 1 ? 'text-accent-red font-bold' : 'text-[#171717]'}`}>
                  ViteSans-Regular
                </span>
              </div>
            </div>

            {story2Step === 1 && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-1 animate-fade-in text-[10px]">
                <p className="text-accent-red font-bold">⚠️ {t.s2WarningTime}</p>
                <p className="text-accent-red font-bold">⚠️ {t.s2WarningFont}</p>
              </div>
            )}
          </div>
        </div>

        {/* Story Three: Cloned Voice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#E5DED5] pt-16">
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-[#B45309]">CASE STUDY 03</span>
            <h3 className="text-3xl font-normal text-[#171717] font-devanagari">{t.s3Title}</h3>
            
            <button 
              type="button"
              onClick={() => setStory3Step((prev) => (prev + 1) % 2)}
              className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-xl text-xs transition"
            >
              {story3Step === 0 ? "Analyze Frequency Waves" : "Reset Case"}
            </button>
          </div>

          <div className="bg-white border border-[#E5DED5] p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3.5 bg-brand-50 p-4 rounded-2xl border border-brand-200">
              <span className="text-xl cursor-pointer">▶</span>
              <div className="flex-grow flex items-end space-x-0.5 h-8">
                <div className="w-1 h-3 bg-brand-300 rounded"></div>
                <div className={`w-1 h-7 rounded transition-all duration-300 ${story3Step === 1 ? 'bg-accent-red h-4' : 'bg-accent-blue'}`}></div>
                <div className="w-1 h-5 bg-brand-300 rounded"></div>
                <div className={`w-1 h-8 rounded transition-all duration-300 ${story3Step === 1 ? 'bg-accent-red h-3' : 'bg-accent-blue'}`}></div>
                <div className="w-1 h-2 bg-brand-200 rounded"></div>
              </div>
              <span className="text-[9px] text-[#5F5F5F]">0:18</span>
            </div>

            {story3Step === 1 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2 animate-fade-in text-center">
                <span className="text-accent-red font-bold block text-xs">⚠️ {t.s3WarningVoice}</span>
                <p className="text-xs font-black text-[#B45309] font-devanagari">{t.s3Verdict}</p>
              </div>
            )}
          </div>
        </div>

        {/* Story Four: Hospital Report */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#E5DED5] pt-16">
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-[#B45309]">CASE STUDY 04</span>
            <h3 className="text-3xl font-normal text-[#171717] font-devanagari">{t.s4Title}</h3>
            
            <button 
              type="button"
              onClick={() => setStory4Step((prev) => (prev + 1) % 2)}
              className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-xl text-xs transition"
            >
              {story4Step === 0 ? "Verify Digital seal" : "Reset Case"}
            </button>
          </div>

          <div className="bg-white border border-[#E5DED5] p-6 rounded-3xl shadow-sm space-y-4">
            <h5 className="font-bold text-[10px] text-brand-500 uppercase tracking-widest text-center">{t.s4Doc}</h5>
            <div className="text-[10px] text-brand-800 space-y-1 pt-2">
              <p>Patient Name: Amit Verma</p>
              <p>Signee: Dr. Sunil Sen</p>
            </div>
            
            <div className="border-t border-brand-100 pt-3 flex justify-between items-center text-[9px]">
              <span>Seal validation</span>
              <span className={`font-bold uppercase ${story4Step === 1 ? 'text-accent-red' : 'text-accent-green'}`}>
                {story4Step === 1 ? 'FAILED' : 'CHECKED'}
              </span>
            </div>

            {story4Step === 1 && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-1 animate-fade-in text-[10px]">
                <p className="text-accent-red font-bold">⚠️ {t.s4WarningDoc}</p>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Fade Emotional Pivot Panel */}
      <section className="bg-[#171717] py-28 text-[#F6F3EE] text-center border-t border-b border-[#E5DED5]/20 font-devanagari">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <p className="text-2xl font-light text-[#EFE9DF]">{t.pivot1}</p>
          <p className="text-3xl font-normal text-white">{t.pivot2}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-[#B45309]">{t.pivot3}</p>
        </div>
      </section>

      {/* Solution introducing PARAKH & Interactive Upload Sandbox */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-4xl font-normal leading-tight text-[#171717] font-devanagari">
            {t.solutionTitle}
          </h3>
          <p className="text-[#5F5F5F] text-sm leading-relaxed font-devanagari">
            {t.solutionDesc}
          </p>
        </div>

        {/* Sandbox container */}
        <div className="bg-white border border-[#E5DED5] rounded-3xl p-6 shadow-sm space-y-6">
          {sandboxState === 'idle' ? (
            <div 
              onClick={startSandboxDemo}
              className="border border-dashed border-[#B45309]/30 hover:border-[#B45309] bg-[#F6F3EE] p-10 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 min-h-[140px]"
            >
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-[#5F5F5F] font-devanagari">{t.demoUpload}</p>
            </div>
          ) : sandboxState !== 'done' ? (
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-between items-center text-[9px] font-bold text-[#5F5F5F] pb-2 border-b border-[#E5DED5]">
                <span className={sandboxState === 'uploading' ? 'text-[#B45309]' : ''}>1. {t.stepUploading}</span>
                <span className={sandboxState === 'analyzing' ? 'text-[#B45309]' : ''}>2. {t.stepAnalyzing}</span>
                <span className={sandboxState === 'verifying' ? 'text-[#B45309]' : ''}>3. {t.stepVerifying}</span>
                <span className={sandboxState === 'generating' ? 'text-[#B45309]' : ''}>4. {t.stepGenerating}</span>
              </div>
              <div className="relative w-8 h-8 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-[#E5DED5] border-t-[#B45309] animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-5 rounded-2xl text-center space-y-2">
              <span className="text-green-700 font-bold block text-sm">✓ {t.resultAuthentic}</span>
              <p className="text-[10px] text-[#5F5F5F] font-devanagari">{t.resultAuthenticDesc}</p>
              <button 
                onClick={() => setActiveTab('auth_signup')}
                className="text-xs text-[#B45309] font-bold hover:underline"
              >
                {t.viewFullReport}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Verify Grid Section */}
      <section className="bg-[#EFE9DF] py-24 border-t border-b border-[#E5DED5]">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">Pillars</span>
            <h3 className="text-3xl font-normal text-[#171717] font-devanagari">{t.verifyTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-devanagari">
            <PremiumCard title={t.voice} desc={t.voiceDesc} preview="Waveform vector details" />
            <PremiumCard title={t.image} desc={t.imageDesc} preview="Quantization compression matrix" />
            <PremiumCard title={t.video} desc={t.videoDesc} preview="Lip-sync frame hashes" />
            <PremiumCard title={t.document} desc={t.documentDesc} preview="PDF creator & signature blocks" />
            <PremiumCard title={t.qr} desc={t.qrDesc} preview="URL target audits" />
            <PremiumCard title={t.identity} desc={t.identityDesc} preview="Govt document validation layer" />
          </div>
        </div>
      </section>

      {/* Outcomes section */}
      <section className="max-w-4xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 font-devanagari">
          <h3 className="text-2xl font-light text-[#5F5F5F] leading-normal">
            "{t.whyTitle1}"
          </h3>
          <p className="text-lg font-semibold text-[#171717]">
            {t.whyTitle2}
          </p>
        </div>

        <div className="space-y-6 font-devanagari text-xs">
          <div className="p-5 bg-white border border-[#E5DED5] rounded-2xl shadow-sm space-y-1">
            <h4 className="font-bold text-[#171717]">{t.why1}</h4>
            <p className="text-[#5F5F5F]">{t.why1Desc}</p>
          </div>
          <div className="p-5 bg-white border border-[#E5DED5] rounded-2xl shadow-sm space-y-1">
            <h4 className="font-bold text-[#171717]">{t.why2}</h4>
            <p className="text-[#5F5F5F]">{t.why2Desc}</p>
          </div>
          <div className="p-5 bg-white border border-[#E5DED5] rounded-2xl shadow-sm space-y-1">
            <h4 className="font-bold text-[#171717]">{t.why3}</h4>
            <p className="text-[#5F5F5F]">{t.why3Desc}</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-[#B45309] to-[#92400E] py-24 text-white text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-8 font-devanagari">
          <h3 className="text-3xl sm:text-4xl font-normal text-[#F6F3EE]">{t.finalTitle}</h3>
          <p className="text-[#EFE9DF] text-sm font-light">{t.finalSub}</p>
          <button 
            onClick={() => setActiveTab('auth_signup')}
            className="bg-[#171717] hover:bg-[#2A2A2A] text-white font-bold py-3.5 px-8 rounded-xl transition duration-150 text-xs shadow-md min-h-[44px]"
          >
            {t.finalButton}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5DED5] py-12 text-center text-xs text-[#5F5F5F] space-y-4 max-w-5xl mx-auto font-devanagari">
        <p>PARAKH – {t.logoTagline}</p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:text-[#171717] transition">{t.footerPrivacy}</a>
          <span>|</span>
          <a href="#" className="hover:text-[#171717] transition">{t.footerTerms}</a>
          <span>|</span>
          <a href="#" className="hover:text-[#171717] transition">{t.footerContact}</a>
        </div>
      </footer>
    </div>
  );
}

interface PremiumCardProps {
  title: string;
  desc: string;
  preview: string;
}

function PremiumCard({ title, desc, preview }: PremiumCardProps) {
  return (
    <div className="bg-white border border-[#E5DED5] p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-300 space-y-4 cursor-pointer hover:scale-[1.01]">
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-[#171717]">{title}</h4>
        <p className="text-[10px] text-[#5F5F5F] leading-relaxed font-light">{desc}</p>
      </div>
      <div className="bg-[#F6F3EE] p-3.5 rounded-xl border border-[#E5DED5] text-[9px] text-brand-400 font-mono">
        {preview}
      </div>
    </div>
  );
}
