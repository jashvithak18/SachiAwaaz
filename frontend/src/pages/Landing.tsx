import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS = {
  en: {
    tagline: "परख सच की, भरोसा अपने निर्णयों का।",
    heroTitle1: "We know what",
    heroTitle2: "you're going through.",
    heroSub: "In a world where anything can be created, your trust is the easiest thing to manipulate.",
    
    menuHowItWorks: "How It Works",
    menuUseCases: "Use Cases",
    menuAbout: "About",
    menuVerifyNow: "Verify Now",
    
    underTitle: "YOU'VE BEEN THERE. WE UNDERSTAND.",
    
    card1Title: "You received an internship offer.",
    card1Lines: ["It looked perfect.", "The company. The role.", "The signature."],
    card1Highlight: "But it was fake.",
    
    card2Title: "You got a payment screenshot.",
    card2Lines: ["Everything matched.", "Amount, time,", "reference ID."],
    card2Highlight: "But it was edited.",
    
    card3Title: "You received your daughter's voice.",
    card3Lines: ["It sounded exactly", "like her."],
    card3Highlight: "But it was AI.",
    
    card4Title: "You downloaded a medical report.",
    card4Lines: ["It had the seal.", "The format.", "Everything."],
    card4Highlight: "But it was forged.",
    
    card5Title: "You scanned a QR code.",
    card5Lines: ["It looked official.", "It redirected you", "somewhere."],
    card5Highlight: "But it was a trap.",
    
    bannerText1: "It's not your fault. It looks real. That's how they fool you.",
    bannerText2: "But now, you don't have to fall for it.",
    
    solutionTitle: "That's why we built PARAKH.",
    solutionDesc: "PARAKH helps you verify digital content before you make decisions. Simple. Private. Powerful.",
    
    demoUpload: "Drag & drop your file here or click to browse",
    stepUploading: "Uploading",
    stepAnalyzing: "Analyzing",
    stepVerifying: "Verifying",
    stepGenerating: "Generating Result",
    resultAuthentic: "Authentic",
    resultAuthenticDesc: "This content is authentic.",
    viewFullReport: "View Full Report →",
    
    verifyTitle: "WE VERIFY WHAT MATTERS",
    verifySub: "One platform. Every format.",
    
    verifyVoice: "Voice",
    verifyDoc: "Document",
    verifyImg: "Image",
    verifyVid: "Video",
    verifyQr: "QR Code",
    verifyEmail: "Email",
    
    howTitle: "HOW IT WORKS",
    howSub: "Four simple steps. One trusted answer.",
    step1Title: "Upload",
    step1Desc: "Add any file or content.",
    step2Title: "Analyze",
    step2Desc: "Our system checks thousands of signals.",
    step3Title: "Verify",
    step3Desc: "Advanced forensics + AI verification.",
    step4Title: "Get Result",
    step4Desc: "Clear. Simple. Actionable.",
    
    finalTitle: "If something feels off...",
    finalSub: "Check before you believe.",
    finalButton: "Start Verifying Now →",
    
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerContact: "Contact Support"
  },
  hi: {
    tagline: "परख सच की, भरोसा अपने निर्णयों का।",
    heroTitle1: "हम जानते हैं कि आप",
    heroTitle2: "किस दौर से गुजर रहे हैं।",
    heroSub: "एक ऐसी दुनिया में जहां कुछ भी बनाया जा सकता है, आपका विश्वास हेरफेर करने के लिए सबसे आसान चीज है।",
    
    menuHowItWorks: "काम कैसे करता है",
    menuUseCases: "उपयोग के मामले",
    menuAbout: "हमारे बारे में",
    menuVerifyNow: "अभी जांचें",
    
    underTitle: "आप वहां रहे हैं। हम समझते हैं।",
    
    card1Title: "आपको इंटर्नशिप का प्रस्ताव मिला।",
    card1Lines: ["यह बिल्कुल सही लग रहा था।", "कंपनी। भूमिका।", "हस्ताक्षर।"],
    card1Highlight: "लेकिन वह नकली था।",
    
    card2Title: "आपको भुगतान का स्क्रीनशॉट मिला।",
    card2Lines: ["सब कुछ मेल खा रहा था।", "राशि, समय,", "संदर्भ आईडी।"],
    card2Highlight: "लेकिन यह संपादित था।",
    
    card3Title: "आपको अपनी बेटी की आवाज़ मिली।",
    card3Lines: ["यह बिल्कुल उसकी तरह", "लग रही थी।"],
    card3Highlight: "लेकिन वह एआई था।",
    
    card4Title: "आपने एक मेडिकल रिपोर्ट डाउनलोड की।",
    card4Lines: ["इस पर सील थी।", "प्रारूप।", "सब कुछ।"],
    card4Highlight: "लेकिन वह जाली था।",
    
    card5Title: "आपने एक क्यूआर कोड स्कैन किया।",
    card5Lines: ["यह आधिकारिक लग रहा था।", "इसने आपको कहीं और", "रीडायरेक्ट किया।"],
    card5Highlight: "लेकिन वह एक जाल था।",
    
    bannerText1: "यह आपकी गलती नहीं है। यह असली लगता है। वे आपको इसी तरह बेवकूफ बनाते हैं।",
    bannerText2: "लेकिन अब, आपको इसके झांसे में आने की जरूरत नहीं है।",
    
    solutionTitle: "इसीलिए हमने परख बनाया।",
    solutionDesc: "परख निर्णय लेने से पहले डिजिटल सामग्री को सत्यापित करने में आपकी सहायता करता है। सरल। निजी। शक्तिशाली।",
    
    demoUpload: "अपनी फ़ाइल यहाँ खींचें और छोड़ें या ब्राउज़ करें",
    stepUploading: "अपलोड हो रहा है",
    stepAnalyzing: "विश्लेषण हो रहा है",
    stepVerifying: "सत्यापित हो रहा है",
    stepGenerating: "परिणाम उत्पन्न हो रहा है",
    resultAuthentic: "प्रामाणिक",
    resultAuthenticDesc: "यह सामग्री प्रामाणिक है।",
    viewFullReport: "पूरी रिपोर्ट देखें →",
    
    verifyTitle: "हम सत्यापित करते हैं जो मायने रखता है",
    verifySub: "एक मंच। हर प्रारूप।",
    
    verifyVoice: "आवाज़",
    verifyDoc: "दस्तावेज़",
    verifyImg: "छवि",
    verifyVid: "वीडियो",
    verifyQr: "क्यूआर कोड",
    verifyEmail: "ईमेल",
    
    howTitle: "यह कैसे काम करता है",
    howSub: "चार सरल कदम। एक विश्वसनीय उत्तर।",
    step1Title: "अपलोड",
    step1Desc: "कोई भी फ़ाइल या सामग्री जोड़ें।",
    step2Title: "विश्लेषण",
    step2Desc: "हमारा सिस्टम हजारों सिग्नलों की जांच करता है।",
    step3Title: "सत्यापन",
    step3Desc: "उन्नत फोरेंसिक + एआई सत्यापन।",
    step4Title: "परिणाम प्राप्त करें",
    step4Desc: "स्पष्ट। सरल। कार्रवाई योग्य।",
    
    finalTitle: "अगर कुछ अजीब लगता है...",
    finalSub: "विश्वास करने से पहले जांचें।",
    finalButton: "अभी सत्यापन शुरू करें →",
    
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerContact: "सहायता केंद्र"
  }
};

export default function Landing() {
  const { setActiveTab } = useStore();
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  // Tab selections in engine list
  const [activeEngine, setActiveEngine] = useState<'voice' | 'doc' | 'img' | 'vid' | 'qr' | 'email'>('voice');

  // Interactive Verification Demo State
  const [demoState, setDemoState] = useState<'idle' | 'uploading' | 'analyzing' | 'verifying' | 'generating' | 'done'>('idle');

  const runDemoVerification = () => {
    setDemoState('uploading');
    setTimeout(() => {
      setDemoState('analyzing');
      setTimeout(() => {
        setDemoState('verifying');
        setTimeout(() => {
          setDemoState('generating');
          setTimeout(() => {
            setDemoState('done');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#B45309]/15 overflow-x-hidden antialiased text-[#171717] relative"
      style={{ backgroundColor: '#F6F3EE' }}
    >
      
      {/* Sticky Top Navigation */}
      <header className="border-b border-[#E5DED5]/40 sticky top-0 z-50 backdrop-blur-md bg-[#F6F3EE]/80 transition">
        <div className="max-w-5xl mx-auto px-6 py-4.5 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <span className="font-semibold text-lg tracking-tight">PARAKH</span>
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#5F5F5F] font-devanagari">
              <a href="#how-it-works" className="hover:text-[#171717] transition">{t.menuHowItWorks}</a>
              <a href="#scenarios" className="hover:text-[#171717] transition">{t.menuUseCases}</a>
            </nav>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold">
            {/* Lang switcher */}
            <div className="flex items-center space-x-1.5 text-[#5F5F5F]">
              <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-[#171717] font-bold' : ''}`}>English</button>
              <span>|</span>
              <button onClick={() => setLang('hi')} className={`font-devanagari ${lang === 'hi' ? 'text-[#171717] font-bold' : ''}`}>हिन्दी</button>
            </div>
            
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4.5 py-2 rounded-xl transition duration-150"
            >
              {t.menuVerifyNow}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        {/* Left Side */}
        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <span className="text-xl font-bold tracking-tight text-[#171717]">PARAKH</span>
            <p className="text-sm font-bold text-[#B45309] font-devanagari">{t.tagline}</p>
          </div>
          <h2 className="text-5xl sm:text-6xl font-light leading-[1.05] tracking-tight text-[#171717] font-devanagari">
            {t.heroTitle1} <br />
            <span className="text-[#171717] font-normal">{t.heroTitle2}</span>
          </h2>
          <p className="text-[#5F5F5F] text-sm leading-relaxed max-w-md font-devanagari">
            {t.heroSub}
          </p>
        </div>

        {/* Right Side: Visual layered stack mockup cards */}
        <div className="relative h-[320px] w-full flex items-center justify-center select-none pointer-events-none">
          {/* Card 1 */}
          <div className="absolute top-[5%] bg-white border border-[#E5DED5] p-4 rounded-xl shadow-lg w-52 rotate-[-3deg] z-20">
            <p className="text-[7px] text-[#5F5F5F] font-bold uppercase">OFFER LETTER</p>
            <p className="text-[10px] font-bold text-brand-800 mt-1">Internship offer letter</p>
            <div className="h-0.5 bg-brand-100 rounded w-full mt-2"></div>
            <div className="h-0.5 bg-brand-100 rounded w-4/5 mt-1"></div>
          </div>
          {/* Card 2 */}
          <div className="absolute top-[35%] bg-white border border-[#E5DED5] p-4 rounded-xl shadow-md w-48 rotate-[2deg] z-10">
            <p className="text-[7px] text-[#5F5F5F] font-bold uppercase">Payment Received</p>
            <p className="text-sm font-black text-[#171717] mt-0.5">₹24,500</p>
            <p className="text-[8px] text-brand-400">From Rohan Sharma</p>
          </div>
          {/* Card 3 */}
          <div className="absolute bottom-[5%] bg-white border border-[#E5DED5] p-3.5 rounded-xl shadow-md w-52 rotate-[-1deg] z-30 flex items-center space-x-2">
            <span className="text-xs">▶</span>
            <div className="flex-grow flex items-center space-x-0.5">
              <div className="w-0.5 h-3 bg-brand-300"></div>
              <div className="w-0.5 h-4 bg-brand-850"></div>
              <div className="w-0.5 h-2 bg-brand-300"></div>
            </div>
            <span className="text-[8px] text-brand-400">0:18</span>
          </div>
        </div>
      </section>

      {/* Section 2: Scenario Cards (YOU'VE BEEN THERE. WE UNDERSTAND) */}
      <section id="scenarios" className="bg-[#EFE9DF] py-24 border-t border-b border-[#E5DED5]">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">
              {t.underTitle}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-devanagari">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DED5] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xl">💼</span>
                <h4 className="font-bold text-xs text-[#171717]">{t.card1Title}</h4>
                <div className="text-[10px] text-[#5F5F5F] space-y-1 leading-normal">
                  {t.card1Lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#B45309]">{t.card1Highlight}</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DED5] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xl">🕒</span>
                <h4 className="font-bold text-xs text-[#171717]">{t.card2Title}</h4>
                <div className="text-[10px] text-[#5F5F5F] space-y-1 leading-normal">
                  {t.card2Lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#B45309]">{t.card2Highlight}</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DED5] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xl">🎙️</span>
                <h4 className="font-bold text-xs text-[#171717]">{t.card3Title}</h4>
                <div className="text-[10px] text-[#5F5F5F] space-y-1 leading-normal">
                  {t.card3Lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#B45309]">{t.card3Highlight}</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DED5] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xl">📄</span>
                <h4 className="font-bold text-xs text-[#171717]">{t.card4Title}</h4>
                <div className="text-[10px] text-[#5F5F5F] space-y-1 leading-normal">
                  {t.card4Lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#B45309]">{t.card4Highlight}</p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DED5] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xl">🔗</span>
                <h4 className="font-bold text-xs text-[#171717]">{t.card5Title}</h4>
                <div className="text-[10px] text-[#5F5F5F] space-y-1 leading-normal">
                  {t.card5Lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#B45309]">{t.card5Highlight}</p>
            </div>
          </div>

          <div className="text-center space-y-1 text-sm font-devanagari pt-4">
            <p className="text-[#5F5F5F]">{t.bannerText1}</p>
            <p className="font-bold text-[#171717]">{t.bannerText2}</p>
          </div>
        </div>
      </section>

      {/* Section 3 & 4: Introduce PARAKH & Demo Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-4xl font-normal leading-tight text-[#171717] font-devanagari">
            {t.solutionTitle}
          </h3>
          <p className="text-[#5F5F5F] text-sm leading-relaxed font-devanagari">
            {t.solutionDesc}
          </p>
        </div>

        {/* Demo verification box */}
        <div className="bg-white border border-[#E5DED5] rounded-3xl p-6 shadow-sm space-y-6">
          {demoState === 'idle' ? (
            <div 
              onClick={runDemoVerification}
              className="border border-dashed border-[#B45309]/30 hover:border-[#B45309] bg-[#F6F3EE] p-8 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 min-h-[140px]"
            >
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-[#5F5F5F] font-devanagari">{t.demoUpload}</p>
            </div>
          ) : demoState !== 'done' ? (
            <div className="p-6 text-center space-y-4">
              <div className="flex justify-between items-center text-[9px] font-bold text-[#5F5F5F] pb-2 border-b border-[#E5DED5]">
                <span className={demoState === 'uploading' ? 'text-[#B45309]' : ''}>1. {t.stepUploading}</span>
                <span className={demoState === 'analyzing' ? 'text-[#B45309]' : ''}>2. {t.stepAnalyzing}</span>
                <span className={demoState === 'verifying' ? 'text-[#B45309]' : ''}>3. {t.stepVerifying}</span>
                <span className={demoState === 'generating' ? 'text-[#B45309]' : ''}>4. {t.stepGenerating}</span>
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

      {/* Section 5: We Verify What Matters */}
      <section className="bg-[#EFE9DF] py-20 border-t border-b border-[#E5DED5]">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">{t.verifyTitle}</span>
            <h3 className="text-2xl font-normal text-[#171717] font-devanagari">{t.verifySub}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 font-devanagari">
            <CategoryTab label={t.verifyVoice} active={activeEngine === 'voice'} onClick={() => setActiveEngine('voice')} />
            <CategoryTab label={t.verifyDoc} active={activeEngine === 'doc'} onClick={() => setActiveEngine('doc')} />
            <CategoryTab label={t.verifyImg} active={activeEngine === 'img'} onClick={() => setActiveEngine('img')} />
            <CategoryTab label={t.verifyVid} active={activeEngine === 'vid'} onClick={() => setActiveEngine('vid')} />
            <CategoryTab label={t.verifyQr} active={activeEngine === 'qr'} onClick={() => setActiveEngine('qr')} />
            <CategoryTab label={t.verifyEmail} active={activeEngine === 'email'} onClick={() => setActiveEngine('email')} />
          </div>

          {/* Description details card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5DED5] min-h-[100px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeEngine === 'voice' && (
                <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyVoice}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Inspects vocoder anomalies, pitch fluctuations, and synthesis indicators.</p>
                </motion.div>
              )}
              {activeEngine === 'doc' && (
                <motion.div key="doc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyDoc}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Scans PDF creator tags, signature blocks, and font compilation changes.</p>
                </motion.div>
              )}
              {activeEngine === 'img' && (
                <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyImg}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Performs JPEG quantization checks, compression artifact scans, and metadata checks.</p>
                </motion.div>
              )}
              {activeEngine === 'vid' && (
                <motion.div key="vid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyVid}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Reviews synchronization layouts, frame continuity, and video compiler tags.</p>
                </motion.div>
              )}
              {activeEngine === 'qr' && (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyQr}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Resolves redirection URLs and audits destination safety registers.</p>
                </motion.div>
              )}
              {activeEngine === 'email' && (
                <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyEmail}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Verifies sender SMTP headers and domains against cryptographic keys.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">{t.howTitle}</span>
          <h3 className="text-2xl font-normal text-[#171717] font-devanagari">{t.howSub}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 font-devanagari">
          <StepItem number="01" title={t.step1Title} desc={t.step1Desc} />
          <StepItem number="02" title={t.step2Title} desc={t.step2Desc} />
          <StepItem number="03" title={t.step3Title} desc={t.step3Desc} />
          <StepItem number="04" title={t.step4Title} desc={t.step4Desc} />
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="border-t border-[#E5DED5] py-24 text-center space-y-8 font-devanagari" style={{ backgroundColor: '#FFFDF9' }}>
        <h3 className="text-3xl sm:text-4xl font-normal text-[#171717]">{t.finalTitle}</h3>
        <p className="text-[#5F5F5F] text-base font-light">{t.finalSub}</p>
        <button 
          onClick={() => setActiveTab('auth_signup')}
          className="bg-[#171717] hover:bg-[#2A2A2A] text-white font-bold py-3.5 px-8 rounded-xl transition duration-150 text-xs shadow-md min-h-[44px]"
        >
          {t.finalButton}
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5DED5] py-12 text-center text-xs text-[#5F5F5F] space-y-4 max-w-5xl mx-auto font-devanagari">
        <p>PARAKH – {t.tagline}</p>
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

interface CategoryTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function CategoryTab({ label, active, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`text-center py-2 rounded-xl font-bold text-xs transition focus:outline-none ${
        active 
          ? 'bg-[#171717] text-white shadow-sm font-extrabold' 
          : 'text-[#5F5F5F] hover:bg-white hover:text-[#171717]'
      }`}
    >
      {label}
    </button>
  );
}

interface StepItemProps {
  number: string;
  title: string;
  desc: string;
}

function StepItem({ number, title, desc }: StepItemProps) {
  return (
    <div className="bg-white border border-[#E5DED5] p-5 rounded-2xl shadow-sm space-y-2 hover:border-[#B45309]/30 transition duration-200">
      <span className="font-mono text-xs font-bold text-[#B45309] block">{number}</span>
      <h4 className="font-bold text-xs text-[#171717]">{title}</h4>
      <p className="text-[10px] text-[#5F5F5F] leading-relaxed">{desc}</p>
    </div>
  );
}
