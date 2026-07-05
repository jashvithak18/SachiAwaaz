import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS = {
  en: {
    heroTitle1: "It looked real.",
    heroTitle2: "That's why you believed it.",
    scrollExplore: "Scroll to explore",
    
    menuHowItWorks: "How It Works",
    menuUseCases: "Use Cases",
    menuAbout: "About",
    menuVerifyNow: "Verify Now",
    
    q1: "What if that internship offer wasn't real?",
    q2: "What if the payment screenshot was edited?",
    q3: "What if the voice wasn't actually theirs?",
    q4: "What if the document was forged?",
    q5: "What if the QR code led you somewhere else?",
    
    warningSignature: "Forged Signature",
    warningSignatureDesc: "The signature is not authentic.",
    warningTimestamp: "Edited Timestamp",
    warningTimestampDesc: "The timestamp doesn't match device data.",
    warningFont: "Font Mismatch",
    warningFontDesc: "Inconsistent font detected.",
    warningVoice: "AI-Generated Voice",
    warningVoiceDesc: "This voice is likely generated or cloned.",
    warningMetadata: "Metadata Mismatch",
    warningMetadataDesc: "The document metadata doesn't match its contents.",
    warningQr: "Malicious QR Code",
    warningQrDesc: "This QR code contains a suspicious link.",
    
    pivotTitle1: "Trust is disappearing.",
    pivotTitle2: "We're bringing it back.",
    
    solutionTitle: "That's why we built PARAKH.",
    solutionDesc: "PARAKH helps you verify digital content before you make decisions. Simple. Private. Powerful.",
    
    demoUpload: "Drag & drop your file here or click to browse",
    stepUploading: "Uploading",
    stepAnalyzing: "Analyzing",
    stepVerifying: "Verifying",
    stepGenerating: "Generating Result",
    resultAuthentic: "Authenticity Confirmed",
    resultAuthenticDesc: "This content is verified authentic.",
    viewFullReport: "View Full Report →",
    
    verifyTitle: "What you can verify with PARAKH",
    verifyVoice: "Voice",
    verifyDoc: "Document",
    verifyImg: "Image",
    verifyVid: "Video",
    verifyQr: "QR Code",
    verifyEmail: "Email",
    
    whyTitle1: "You don't need to understand digital forensics.",
    whyTitle2: "You just need to know whether you can trust what you're looking at.",
    why1: "Simple to use",
    why1Desc: "Anyone can verify in seconds.",
    why2: "Private & Secure" ,
    why2Desc: "Your data stays yours.",
    why3: "Accurate & Reliable",
    why3Desc: "Advanced verification you can trust.",
    
    finalTitle: "If something feels off...",
    finalSub: "Check before you believe.",
    finalButton: "Start Verifying",
    
    footerText: "PARAKH. Verify before you trust.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerContact: "Contact Support"
  },
  hi: {
    heroTitle1: "यह असली लग रहा था।",
    heroTitle2: "इसीलिए आपने विश्वास किया।",
    scrollExplore: "तलाशने के लिए स्क्रॉल करें",
    
    menuHowItWorks: "काम कैसे करता है",
    menuUseCases: "उपयोग के मामले",
    menuAbout: "हमारे बारे में",
    menuVerifyNow: "अभी जांचें",
    
    q1: "क्या हो अगर वह इंटर्नशिप ऑफर असली नहीं था?",
    q2: "क्या हो अगर भुगतान स्क्रीनशॉट एडिट किया गया था?",
    q3: "क्या हो अगर वह आवाज़ वास्तव में उनकी नहीं थी?",
    q4: "क्या हो अगर वह दस्तावेज़ जाली था?",
    q5: "क्या हो अगर क्यूआर कोड आपको कहीं और ले गया?",
    
    warningSignature: "जाली हस्ताक्षर",
    warningSignatureDesc: "हस्ताक्षर प्रामाणिक नहीं है।",
    warningTimestamp: "संपादित टाइमस्टैम्प",
    warningTimestampDesc: "टाइमस्टैम्प डिवाइस डेटा से मेल नहीं खाता।",
    warningFont: "फ़ॉन्ट बेमेल",
    warningFontDesc: "असंगत फ़ॉन्ट पाया गया।",
    warningVoice: "एआई-जनित आवाज़",
    warningVoiceDesc: "यह आवाज़ संभावित रूप से क्लोन की गई है।",
    warningMetadata: "मेटाडेटा बेमेल",
    warningMetadataDesc: "दस्तावेज़ मेटाडेटा उसकी सामग्री से मेल नहीं खाता।",
    warningQr: "दुर्भावनापूर्ण क्यूआर कोड",
    warningQrDesc: "इस क्यूआर कोड में एक संदिग्ध लिंक है।",
    
    pivotTitle1: "विश्वास गायब हो रहा है।",
    pivotTitle2: "हम इसे वापस ला रहे हैं।",
    
    solutionTitle: "इसीलिए हमने परख बनाया।",
    solutionDesc: "परख निर्णय लेने से पहले डिजिटल सामग्री को सत्यापित करने में आपकी सहायता करता है। सरल। निजी। शक्तिशाली।",
    
    demoUpload: "अपनी फ़ाइल यहाँ खींचें और छोड़ें या ब्राउज़ करें",
    stepUploading: "अपलोड हो रहा है",
    stepAnalyzing: "विश्लेषण हो रहा है",
    stepVerifying: "सत्यापित हो रहा है",
    stepGenerating: "परिणाम उत्पन्न हो रहा है",
    resultAuthentic: "प्रामाणिकता की पुष्टि",
    resultAuthenticDesc: "यह सामग्री सत्यापित और सुरक्षित है।",
    viewFullReport: "पूरी रिपोर्ट देखें →",
    
    verifyTitle: "परख के साथ आप क्या सत्यापित कर सकते हैं",
    verifyVoice: "आवाज़",
    verifyDoc: "दस्तावेज़",
    verifyImg: "छवि",
    verifyVid: "वीडियो",
    verifyQr: "क्यूआर कोड",
    verifyEmail: "ईमेल",
    
    whyTitle1: "आपको डिजिटल फॉरेंसिक को समझने की आवश्यकता नहीं है।",
    whyTitle2: "आपको बस यह जानने की जरूरत है कि आप जो देख रहे हैं उस पर भरोसा कर सकते हैं या नहीं।",
    why1: "उपयोग में सरल",
    why1Desc: "कोई भी सेकंड में सत्यापित कर सकता है।",
    why2: "निजी और सुरक्षित",
    why2Desc: "आपका डेटा आपका ही रहता है।",
    why3: "सटीक और विश्वसनीय",
    why3Desc: "उन्नत सत्यापन जिस पर आप भरोसा कर सकते हैं।",
    
    finalTitle: "अगर कुछ अजीब लगता है...",
    finalSub: "विश्वास करने से पहले जांचें।",
    finalButton: "सत्यापन शुरू करें",
    
    footerText: "परख। भरोसा करने से पहले परखें।",
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
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <span className="font-semibold text-lg tracking-tight">PARAKH</span>
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#5F5F5F] font-devanagari">
              <a href="#how-it-works" className="hover:text-[#171717] transition">{t.menuHowItWorks}</a>
              <a href="#scenarios" className="hover:text-[#171717] transition">{t.menuUseCases}</a>
              <a href="#about" className="hover:text-[#171717] transition">{t.menuAbout}</a>
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
              className="bg-[#171717] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-xl transition duration-150"
            >
              {t.menuVerifyNow}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center min-h-[85vh] flex flex-col justify-center items-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-light leading-[1.05] tracking-tight text-[#171717] font-devanagari">
            {t.heroTitle1} <br />
            <span className="text-[#B45309] font-normal">{t.heroTitle2}</span>
          </h2>
        </div>

        {/* Scroll exploration indicator */}
        <div className="space-y-2 pt-12 text-[#5F5F5F] text-xs font-devanagari flex flex-col items-center">
          <span>{t.scrollExplore}</span>
          <span className="animate-bounce mt-1">↓</span>
        </div>
      </section>

      {/* Section 2: The Problem - Scroll Storytelling */}
      <section id="scenarios" className="max-w-4xl mx-auto px-6 py-20 space-y-20">
        
        {/* Scenario 1: Internship offer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-t border-[#E5DED5] pt-12">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#B45309]">SCENARIO 01</span>
            <h4 className="font-semibold text-lg text-[#171717] leading-snug font-devanagari">{t.q1}</h4>
          </div>
          {/* Mockup letter */}
          <div className="bg-white border border-[#E5DED5] p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center text-[8px] text-brand-400">
              <span className="font-bold">BrandCorp</span>
              <span>12 May 2026</span>
            </div>
            <h5 className="font-bold text-[10px] text-brand-800 text-center">OFFER OF INTERNSHIP</h5>
            <div className="space-y-1.5">
              <div className="h-1 bg-brand-100 rounded w-full"></div>
              <div className="h-1 bg-brand-100 rounded w-5/6"></div>
              <div className="h-1 bg-brand-100 rounded w-4/6"></div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-brand-100 text-[8px]">
              <span className="italic">Robert Shaw</span>
              <span className="text-brand-400">HR Director</span>
            </div>
          </div>
          {/* Warning badge */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-accent-red flex items-center space-x-1">
              <span>⚠️</span> <span>{t.warningSignature}</span>
            </span>
            <p className="text-[10px] text-[#5F5F5F] leading-normal font-devanagari">{t.warningSignatureDesc}</p>
          </div>
        </div>

        {/* Scenario 2: Payment Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-t border-[#E5DED5] pt-12">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#B45309]">SCENARIO 02</span>
            <h4 className="font-semibold text-lg text-[#171717] leading-snug font-devanagari">{t.q2}</h4>
          </div>
          {/* Mockup receipt */}
          <div className="bg-white border border-[#E5DED5] p-4.5 rounded-2xl shadow-sm space-y-2.5">
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-[#5F5F5F]">Payment Successful</span>
              <span className="text-green-600">✓</span>
            </div>
            <p className="text-lg font-black text-[#171717]">₹24,500</p>
            <div className="text-[9px] text-[#5F5F5F] space-y-0.5">
              <p>Sent to: Rohan Sharma</p>
              <p>13 May 2026, 11:42 AM</p>
            </div>
          </div>
          {/* Warning badge */}
          <div className="space-y-2">
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-accent-red block">⚠️ {t.warningTimestamp}</span>
              <p className="text-[9px] text-[#5F5F5F] font-devanagari">{t.warningTimestampDesc}</p>
            </div>
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-accent-red block">⚠️ {t.warningFont}</span>
              <p className="text-[9px] text-[#5F5F5F] font-devanagari">{t.warningFontDesc}</p>
            </div>
          </div>
        </div>

        {/* Scenario 3: Audio waveform */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-t border-[#E5DED5] pt-12">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#B45309]">SCENARIO 03</span>
            <h4 className="font-semibold text-lg text-[#171717] leading-snug font-devanagari">{t.q3}</h4>
          </div>
          {/* Mockup waveform player */}
          <div className="bg-white border border-[#E5DED5] p-4.5 rounded-2xl shadow-sm flex items-center space-x-3">
            <span className="text-lg cursor-pointer">▶</span>
            <div className="flex-grow flex items-center space-x-0.5">
              <div className="w-1 h-4 bg-brand-300 rounded"></div>
              <div className="w-1 h-6 bg-[#B45309] rounded"></div>
              <div className="w-1 h-3 bg-brand-300 rounded"></div>
              <div className="w-1 h-5 bg-brand-300 rounded"></div>
              <div className="w-1 h-2 bg-brand-200 rounded"></div>
            </div>
            <span className="text-[9px] text-brand-400">0:02 / 0:11</span>
          </div>
          {/* Warning badge */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-accent-red block">⚠️ {t.warningVoice}</span>
            <p className="text-[10px] text-[#5F5F5F] leading-normal font-devanagari">{t.warningVoiceDesc}</p>
          </div>
        </div>

        {/* Scenario 4: Forged document */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-t border-[#E5DED5] pt-12">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#B45309]">SCENARIO 04</span>
            <h4 className="font-semibold text-lg text-[#171717] leading-snug font-devanagari">{t.q4}</h4>
          </div>
          {/* Mockup Medical Report */}
          <div className="bg-white border border-[#E5DED5] p-5 rounded-2xl shadow-sm space-y-2.5">
            <h5 className="font-bold text-[9px] text-brand-500 uppercase tracking-widest text-center">MEDICAL REPORT</h5>
            <div className="text-[8px] text-brand-800 space-y-1">
              <p>Patient Name: Amit Verma</p>
              <p>Age / Gender: 34 / Male</p>
              <p>Report Date: 10 May 2026</p>
            </div>
            <div className="border-t border-brand-100 pt-1.5 flex justify-end">
              <span className="text-[8px] border border-brand-200 px-1.5 py-0.5 rounded text-brand-500 font-mono">Digital Signature</span>
            </div>
          </div>
          {/* Warning badge */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-accent-red block">⚠️ {t.warningMetadata}</span>
            <p className="text-[10px] text-[#5F5F5F] leading-normal font-devanagari">{t.warningMetadataDesc}</p>
          </div>
        </div>

        {/* Scenario 5: Fake QR code */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-t border-[#E5DED5] pt-12">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#B45309]">SCENARIO 05</span>
            <h4 className="font-semibold text-lg text-[#171717] leading-snug font-devanagari">{t.q5}</h4>
          </div>
          {/* Mockup QR */}
          <div className="bg-white border border-[#E5DED5] p-4.5 rounded-2xl shadow-sm flex justify-center">
            <div className="w-16 h-16 bg-[#171717] rounded flex items-center justify-center text-white text-xs font-mono font-bold tracking-widest select-none">
              QR
            </div>
          </div>
          {/* Warning badge */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-accent-red block">⚠️ {t.warningQr}</span>
            <p className="text-[10px] text-[#5F5F5F] leading-normal font-devanagari">{t.warningQrDesc}</p>
          </div>
        </div>

      </section>

      {/* Section 3: The Reality - Emotional Pivot */}
      <section className="bg-[#171717] py-24 text-white text-center border-t border-[#E5DED5]/20">
        <div className="max-w-3xl mx-auto px-6 space-y-4 font-devanagari">
          <h3 className="text-3xl sm:text-4xl font-light tracking-tight text-[#EFE9DF]">
            {t.pivotTitle1}
          </h3>
          <p className="text-xl sm:text-2xl font-normal text-white">
            {t.pivotTitle2}
          </p>
        </div>
      </section>

      {/* Section 4 & 5: Solution & Interactive Verification Experience */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left side text */}
        <div className="space-y-6">
          <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">Introducing PARAKH</span>
          <h3 className="text-3xl font-normal leading-tight text-[#171717] font-devanagari">
            {t.solutionTitle}
          </h3>
          <p className="text-[#5F5F5F] text-sm leading-relaxed font-devanagari">
            {t.solutionDesc}
          </p>
        </div>

        {/* Right side verification box */}
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
              {/* Stepper details */}
              <div className="flex justify-between items-center text-[10px] font-bold text-[#5F5F5F] pb-2 border-b border-[#E5DED5]">
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
            <div className="bg-green-50 border border-green-200 p-5 rounded-2xl space-y-3 text-center">
              <span className="text-green-700 font-bold block text-sm">✓ {t.resultAuthentic}</span>
              <p className="text-[10px] text-[#5F5F5F] font-devanagari">{t.resultAuthenticDesc}</p>
              <button 
                onClick={() => setActiveTab('auth_signup')}
                className="text-xs text-accent-blue font-bold hover:underline"
              >
                {t.viewFullReport}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section 6: What You Can Verify */}
      <section className="bg-[#EFE9DF] py-20 border-t border-b border-[#E5DED5]">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center">
            <h3 className="text-2xl font-normal text-[#171717] font-devanagari">{t.verifyTitle}</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 font-devanagari">
            <CategoryTab label={t.verifyVoice} active={activeEngine === 'voice'} onClick={() => setActiveEngine('voice')} />
            <CategoryTab label={t.verifyDoc} active={activeEngine === 'doc'} onClick={() => setActiveEngine('doc')} />
            <CategoryTab label={t.verifyImg} active={activeEngine === 'img'} onClick={() => setActiveEngine('img')} />
            <CategoryTab label={t.verifyVid} active={activeEngine === 'vid'} onClick={() => setActiveEngine('vid')} />
            <CategoryTab label={t.verifyQr} active={activeEngine === 'qr'} onClick={() => setActiveEngine('qr')} />
            <CategoryTab label={t.verifyEmail} active={activeEngine === 'email'} onClick={() => setActiveEngine('email')} />
          </div>

          {/* Tab Description display panel */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5DED5] min-h-[100px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeEngine === 'voice' && (
                <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyVoice}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">{t.verifyVoiceDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'doc' && (
                <motion.div key="doc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyDoc}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">{t.verifyDocDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'img' && (
                <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyImg}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">{t.verifyImgDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'vid' && (
                <motion.div key="vid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyVid}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">{t.verifyVidDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'qr' && (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyQr}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">{t.verifyQrDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'email' && (
                <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <h4 className="font-bold text-xs text-[#171717]">{t.verifyEmail}</h4>
                  <p className="text-[11px] text-[#5F5F5F] leading-normal">Checks SMTP header authentication parameters and sender domains.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 7: Why PARAKH */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="space-y-6 font-devanagari">
          <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">Forensics Index</span>
          <h3 className="text-2xl font-light text-[#5F5F5F] leading-normal">
            "{t.whyTitle1}"
          </h3>
          <p className="text-lg font-semibold text-[#171717]">
            {t.whyTitle2}
          </p>
        </div>

        {/* Right Side list items */}
        <div className="space-y-6 font-devanagari">
          <WhyListItem title={t.why1} desc={t.why1Desc} />
          <WhyListItem title={t.why2} desc={t.why2Desc} />
          <WhyListItem title={t.why3} desc={t.why3Desc} />
        </div>
      </section>

      {/* Section 8: Final CTA */}
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

      {/* Minimal Footer */}
      <footer className="border-t border-[#E5DED5] py-12 text-center text-xs text-[#5F5F5F] space-y-4 max-w-5xl mx-auto font-devanagari">
        <p>{t.footerText}</p>
        <div className="flex justify-center space-x-6">
          <a href="#how-it-works" className="hover:text-[#171717] transition">{t.menuHowItWorks}</a>
          <span>|</span>
          <a href="#scenarios" className="hover:text-[#171717] transition">{t.menuUseCases}</a>
          <span>|</span>
          <a href="#" className="hover:text-[#171717] transition">{t.footerPrivacy}</a>
          <span>|</span>
          <a href="#" className="hover:text-[#171717] transition">{t.footerTerms}</a>
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
      className={`text-center py-2.5 rounded-xl font-bold text-xs transition focus:outline-none ${
        active 
          ? 'bg-[#171717] text-white shadow-sm' 
          : 'text-[#5F5F5F] hover:bg-white hover:text-[#171717]'
      }`}
    >
      {label}
    </button>
  );
}

interface WhyListItemProps {
  title: string;
  desc: string;
}

function WhyListItem({ title, desc }: WhyListItemProps) {
  return (
    <div className="p-4.5 bg-white border border-[#E5DED5] rounded-2xl shadow-sm space-y-1">
      <h4 className="font-bold text-xs text-[#171717]">{title}</h4>
      <p className="text-[11px] text-[#5F5F5F] leading-normal">{desc}</p>
    </div>
  );
}
