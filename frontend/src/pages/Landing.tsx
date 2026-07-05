import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS = {
  en: {
    heroTitle: "Every day, thousands of people trust something they shouldn't.",
    heroSub1: "A fake voice.",
    heroSub2: "A fake document.",
    heroSub3: "A fake screenshot.",
    heroSub4: "A fake identity.",
    heroSub5: "Sometimes, it looks completely real.",
    heroSub6: "That's why PARAKH exists.",
    heroCta1: "Verify Before You Trust",
    heroCta2: "See How It Works",
    
    questionWhatIf: "What if...",
    question1: "What if that internship offer wasn't real?",
    question2: "What if the payment screenshot was edited?",
    question3: "What if the voice wasn't actually theirs?",
    question4: "What if the document was forged?",
    
    scenarioTitle: "Real-life moments where trust is compromised.",
    scenario1Title: "The Internship Offer",
    scenario1Desc: "An official-looking PDF with digital signatures, claiming you got the role. But the company has never heard of it.",
    scenario2Title: "The Transfer Screenshot",
    scenario2Desc: "A payment verification image showing the funds are on the way. The numbers were adjusted on a phone app.",
    scenario3Title: "The Cloned Voice",
    scenario3Desc: "A voice note from a family member asking for urgent help. The accent and tone match perfectly, but the person didn't record it.",
    scenario4Title: "The Forged Certificate",
    scenario4Desc: "A medical report or graduation diploma. The digital seal was compiled using an AI image editor.",
    scenario5Title: "The Payment QR Code",
    scenario5Desc: "A physical sticker covering the shop's scanner, directing transfer details to an unverified private wallet.",
    
    introTitle: "So we built something different.",
    introDesc: "PARAKH helps you verify digital content before you make decisions. We translate complex metadata, pixels, and audio patterns into a simple verdict. So you don't have to guess.",
    
    demoTitle: "Experience it yourself.",
    demoUpload: "Click here to run a simulated verification test",
    demoAnalyzing: "Verifying files...",
    demoAuthentic: "✓ Authentic",
    demoManipulated: "⚠ Possible Manipulation Detected",
    demoExplanation: "We analyzed the noise patterns and verified the audio hash against our biometric index.",
    
    verifyTitle: "What PARAKH verifies",
    verifyVoice: "Voice",
    verifyDoc: "Document",
    verifyImg: "Image",
    verifyVid: "Video",
    verifyQr: "QR Code",
    verifyVoiceDesc: "Biometric authentication against registered voice profiles to verify identity claims.",
    verifyDocDesc: "Structure auditing, author strings extraction, and digital signature checks.",
    verifyImgDesc: "Pixel compression forensics, EXIF metadata history scans, and quantization checks.",
    verifyVidDesc: "Lip-sync alignment, frame consistency, and source hash validations.",
    verifyQrDesc: "Target link verification, domain risk checking, and redirection tracking.",
    
    outcomeTitle: "You don't need to understand digital forensics.",
    outcomeDesc: "You just need to know whether you can trust what you're looking at.",
    
    finalTitle: "If something feels off...",
    finalSub: "Check before you believe.",
    finalButton: "Start Verifying",
    footerText: "PARAKH Digital Authenticity Platform. Dedicated to digital trust.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerContact: "Contact Support"
  },
  hi: {
    heroTitle: "हर दिन, हजारों लोग ऐसी चीज़ों पर भरोसा करते हैं जिन पर उन्हें नहीं करना चाहिए।",
    heroSub1: "एक नकली आवाज़।",
    heroSub2: "एक नकली दस्तावेज़।",
    heroSub3: "एक नकली स्क्रीनशॉट।",
    heroSub4: "एक नकली पहचान।",
    heroSub5: "कभी-कभी, यह पूरी तरह से असली लगता है।",
    heroSub6: "इसीलिए परख (PARAKH) अस्तित्व में है।",
    heroCta1: "भरोसा करने से पहले परखें",
    heroCta2: "देखें कि यह कैसे काम करता है",
    
    questionWhatIf: "क्या हो अगर...",
    question1: "क्या हो अगर वह इंटर्नशिप ऑफर असली नहीं था?",
    question2: "क्या हो अगर भुगतान स्क्रीनशॉट एडिट किया गया था?",
    question3: "क्या हो अगर वह आवाज़ वास्तव में उनकी नहीं थी?",
    question4: "क्या हो अगर वह दस्तावेज़ जाली था?",
    
    scenarioTitle: "वास्तविक जीवन के क्षण जहाँ विश्वास टूटता है।",
    scenario1Title: "इंटर्नशिप प्रस्ताव पत्र",
    scenario1Desc: "डिजिटल हस्ताक्षरों वाला एक आधिकारिक दिखने वाला पीडीएफ। लेकिन कंपनी ने ऐसा कोई पत्र कभी जारी ही नहीं किया था।",
    scenario2Title: "भुगतान का स्क्रीनशॉट",
    scenario2Desc: "एक लेन-देन पुष्टिकरण छवि जिसमें दर्शाया गया है कि पैसा भेजा जा चुका है। एक ऐप पर नंबर बदल दिए गए थे।",
    scenario3Title: "क्लोन की गई आवाज़",
    scenario3Desc: "किसी प्रियजन का वॉयस नोट जिसमें पैसे की मांग की गई है। आवाज़ और लहजा बिल्कुल वैसा ही है, पर उन्होंने इसे रिकॉर्ड नहीं किया था।",
    scenario4Title: "जाली प्रमाण पत्र",
    scenario4Desc: "एक मेडिकल रिपोर्ट या ग्रेजुएशन डिप्लोमा। डिजिटल सील को एआई इमेज एडिटर का उपयोग करके बनाया गया था।",
    scenario5Title: "भुगतान क्यूआर कोड",
    scenario5Desc: "दुकान के स्कैनर पर चिपकाया गया एक भौतिक स्टिकर, जो भुगतान विवरण को असत्यापित वॉलेट में स्थानांतरित करता है।",
    
    introTitle: "इसलिए हमने कुछ अलग बनाया।",
    introDesc: "परख निर्णय लेने से पहले डिजिटल सामग्री को सत्यापित करने में आपकी सहायता करता है। हम जटिल मेटाडेटा, पिक्सल और ऑडियो पैटर्न को एक सरल परिणाम में अनुवादित करते हैं। ताकि आपको अनुमान न लगाना पड़े।",
    
    demoTitle: "स्वयं इसका अनुभव करें।",
    demoUpload: "एक सिम्युलेटेड सत्यापन परीक्षण चलाने के लिए यहाँ क्लिक करें",
    demoAnalyzing: "फ़ाइलों का विश्लेषण किया जा रहा है...",
    demoAuthentic: "✓ प्रामाणिक",
    demoManipulated: "⚠ संभावित हेरफेर का पता चला",
    demoExplanation: "हमने शोर पैटर्न का विश्लेषण किया और अपने बायोमेट्रिक इंडेक्स के खिलाफ ऑडियो हैश को सत्यापित किया।",
    
    verifyTitle: "परख क्या सत्यापित करता है",
    verifyVoice: "आवाज़",
    verifyDoc: "दस्तावेज़",
    verifyImg: "छवि",
    verifyVid: "वीडियो",
    verifyQr: "क्यूआर कोड",
    verifyVoiceDesc: "पहचान के दावों को सत्यापित करने के लिए पंजीकृत वॉयस प्रोफाइल के खिलाफ बायोमेट्रिक सत्यापन।",
    verifyDocDesc: "पीडीएफ संरचना ऑडिटिंग, लेखक डेटा निष्कर्षण, और डिजिटल हस्ताक्षर की जाँच।",
    verifyImgDesc: "पिक्सेल कंप्रेशन फॉरेंसिक, एक्ज़िफ़ मेटाडेटा इतिहास स्कैन और हेरफेर चेक्स।",
    verifyVidDesc: "लिप-सिंक संरेखण, फ़्रेम संगति, और स्रोत हैश सत्यापन।",
    verifyQrDesc: "लक्षित लिंक सत्यापन, डोमेन जोखिम जाँच, और रीडायरेक्शन ट्रैकिंग।",
    
    outcomeTitle: "आपको डिजिटल फॉरेंसिक को समझने की आवश्यकता नहीं है।",
    outcomeDesc: "आपको बस यह जानने की जरूरत है कि आप जो देख रहे हैं उस पर भरोसा कर सकते हैं या नहीं।",
    
    finalTitle: "अगर कुछ अजीब लगता है...",
    finalSub: "विश्वास करने से पहले जांचें।",
    finalButton: "परखना शुरू करें",
    footerText: "परख (PARAKH) डिजिटल प्रामाणिकता मंच। डिजिटल विश्वास के लिए समर्पित।",
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "उपयोग की शर्तें",
    footerContact: "सहायता केंद्र"
  }
};

export default function Landing() {
  const { setActiveTab } = useStore();
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  // Tab selections in engine details
  const [activeEngine, setActiveEngine] = useState<'voice' | 'doc' | 'img' | 'vid' | 'qr'>('voice');

  // Dry-run simulation state
  const [simState, setSimState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [simResult, setSimResult] = useState<'authentic' | 'manipulated'>('authentic');

  const startSimulation = () => {
    setSimState('analyzing');
    setTimeout(() => {
      setSimResult(Math.random() > 0.5 ? 'authentic' : 'manipulated');
      setSimState('done');
    }, 2500);
  };

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#B45309]/15 overflow-x-hidden antialiased text-[#171717] relative"
      style={{ backgroundColor: '#F6F3EE' }}
    >
      
      {/* Navbar */}
      <header className="border-b border-[#E5DED5]/40 sticky top-0 z-50 backdrop-blur-md bg-[#F6F3EE]/80 transition">
        <div className="max-w-5xl mx-auto px-6 py-4.5 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <span className="font-semibold text-lg tracking-tight">PARAKH</span>
            <span className="text-[10px] bg-[#EFE9DF] text-[#5F5F5F] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest font-mono">
              {lang === 'en' ? 'Authenticity' : 'परख'}
            </span>
          </div>

          {/* Language Switcher & Action */}
          <div className="flex items-center space-x-6 text-xs font-semibold">
            <div className="flex items-center bg-[#EFE9DF] rounded-lg p-0.5 border border-[#E5DED5]">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-md transition ${lang === 'en' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#5F5F5F]'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-md transition font-devanagari ${lang === 'hi' ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-[#5F5F5F]'}`}
              >
                हिन्दी
              </button>
            </div>
            
            <button 
              onClick={() => setActiveTab('auth_login')}
              className="text-[#171717] hover:underline"
            >
              {lang === 'en' ? 'Sign In' : 'लॉग इन'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center min-h-[90vh] flex flex-col justify-center items-center space-y-10">
        <div className="space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block">
            {lang === 'en' ? 'Human-First Digital Integrity' : 'मानव-केंद्रित डिजिटल प्रामाणिकता'}
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] tracking-tight text-[#171717] max-w-3xl mx-auto font-devanagari">
            {t.heroTitle}
          </h2>
        </div>

        {/* Cinematic subtle textual indicators */}
        <div className="text-center space-y-2 text-[#5F5F5F] max-w-md mx-auto text-sm sm:text-base border-l border-r border-[#E5DED5] px-6 py-3 bg-[#EFE9DF]/30 rounded-xl font-devanagari">
          <p className="font-semibold">{t.heroSub1}</p>
          <p className="font-semibold">{t.heroSub2}</p>
          <p className="font-semibold">{t.heroSub3}</p>
          <p className="font-semibold">{t.heroSub4}</p>
          <div className="w-1.5 h-1.5 bg-[#B45309] rounded-full mx-auto my-3"></div>
          <p className="text-xs">{t.heroSub5}</p>
          <p className="text-xs text-[#171717] font-bold">{t.heroSub6}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button 
            onClick={() => setActiveTab('auth_signup')}
            className="w-full sm:w-auto bg-[#171717] hover:bg-[#2A2A2A] text-white font-bold py-3.5 px-8 rounded-2xl transition duration-150 text-xs shadow-md min-h-[44px]"
          >
            {t.heroCta1}
          </button>
          <a 
            href="#storytelling"
            className="w-full sm:w-auto border border-[#E5DED5] hover:bg-white text-[#5F5F5F] hover:text-[#171717] font-semibold py-3.5 px-8 rounded-2xl transition text-xs text-center min-h-[44px] block"
          >
            {t.heroCta2}
          </a>
        </div>
      </section>

      {/* Section 2: Scroll Storytelling Questions */}
      <section id="storytelling" className="bg-[#EFE9DF] py-28 border-t border-b border-[#E5DED5] text-[#171717]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-16">
          <span className="text-[10px] font-bold tracking-widest text-[#556B2F] uppercase block">
            {t.questionWhatIf}
          </span>
          
          <div className="space-y-12 font-devanagari">
            <p className="text-xl sm:text-2xl font-light text-[#5F5F5F] hover:text-[#171717] transition duration-300">
              "{t.question1}"
            </p>
            <p className="text-xl sm:text-2xl font-light text-[#5F5F5F] hover:text-[#171717] transition duration-300 border-t border-b border-[#E5DED5]/60 py-6">
              "{t.question2}"
            </p>
            <p className="text-xl sm:text-2xl font-light text-[#5F5F5F] hover:text-[#171717] transition duration-300">
              "{t.question3}"
            </p>
            <p className="text-xl sm:text-2xl font-light text-[#5F5F5F] hover:text-[#171717] transition duration-300 border-t border-[#E5DED5]/60 pt-6">
              "{t.question4}"
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Relatable Real-Life Scenarios */}
      <section className="max-w-4xl mx-auto px-6 py-28 space-y-16">
        <div className="text-center">
          <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block mb-3">Real Incidents</span>
          <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#171717] font-devanagari">
            {t.scenarioTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-devanagari">
          <ScenarioCard number="01" title={t.scenario1Title} desc={t.scenario1Desc} />
          <ScenarioCard number="02" title={t.scenario2Title} desc={t.scenario2Desc} />
          <ScenarioCard number="03" title={t.scenario3Title} desc={t.scenario3Desc} />
          <ScenarioCard number="04" title={t.scenario4Title} desc={t.scenario4Desc} />
          
          <div className="md:col-span-2">
            <ScenarioCard number="05" title={t.scenario5Title} desc={t.scenario5Desc} />
          </div>
        </div>
      </section>

      {/* Section 4: Introducing PARAKH */}
      <section className="bg-[#EFE9DF] py-24 border-t border-b border-[#E5DED5] text-[#171717]">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <h3 className="text-3xl font-normal tracking-tight text-[#171717] font-devanagari">
            {t.introTitle}
          </h3>
          <p className="text-[#5F5F5F] text-sm sm:text-base leading-relaxed font-devanagari font-light">
            {t.introDesc}
          </p>
        </div>
      </section>

      {/* Section 5: Interactive Storytelling Upload Sandbox */}
      <section className="max-w-2xl mx-auto px-6 py-24 space-y-8 text-center">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#556B2F] uppercase block mb-2">Simulated sandbox</span>
          <h3 className="text-xl font-normal text-[#171717] font-devanagari">{t.demoTitle}</h3>
        </div>

        <div className="bg-white border border-[#E5DED5] rounded-3xl p-8 shadow-sm space-y-6">
          {simState === 'idle' && (
            <button 
              onClick={startSimulation}
              className="w-full border border-dashed border-[#B45309]/30 hover:border-[#B45309] bg-[#F6F3EE] p-10 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 focus:outline-none min-h-[160px]"
            >
              <span className="text-3xl text-[#B45309]">🗂️</span>
              <span className="text-xs font-semibold text-[#5F5F5F] font-devanagari">{t.demoUpload}</span>
            </button>
          )}

          {simState === 'analyzing' && (
            <div className="p-8 text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#E5DED5] border-t-[#B45309] animate-spin"></div>
              </div>
              <p className="text-xs text-[#5F5F5F] animate-pulse font-devanagari font-bold">{t.demoAnalyzing}</p>
            </div>
          )}

          {simState === 'done' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border text-center space-y-3"
              style={{
                backgroundColor: simResult === 'authentic' ? '#F0FDF4' : '#FEF2F2',
                borderColor: simResult === 'authentic' ? '#BBF7D0' : '#FCA5A5'
              }}
            >
              <p className={`text-sm font-black uppercase font-devanagari ${
                simResult === 'authentic' ? 'text-green-700' : 'text-red-700'
              }`}>
                {simResult === 'authentic' ? t.demoAuthentic : t.demoManipulated}
              </p>
              <p className="text-xs text-[#5F5F5F] leading-normal font-devanagari">{t.demoExplanation}</p>
              <button 
                onClick={() => setSimState('idle')}
                className="text-[10px] text-[#B45309] hover:underline font-bold"
              >
                Reset Test
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Section 6: Elegant tab-based supported engines experience */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-[#E5DED5]">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase block mb-2">Supported Categories</span>
          <h3 className="text-2xl font-normal text-[#171717] font-devanagari">{t.verifyTitle}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left Tab List */}
          <div className="flex flex-col space-y-1 bg-white border border-[#E5DED5] p-2 rounded-2xl shadow-sm">
            <TabButton label={t.verifyVoice} active={activeEngine === 'voice'} onClick={() => setActiveEngine('voice')} />
            <TabButton label={t.verifyDoc} active={activeEngine === 'doc'} onClick={() => setActiveEngine('doc')} />
            <TabButton label={t.verifyImg} active={activeEngine === 'img'} onClick={() => setActiveEngine('img')} />
            <TabButton label={t.verifyVid} active={activeEngine === 'vid'} onClick={() => setActiveEngine('vid')} />
            <TabButton label={t.verifyQr} active={activeEngine === 'qr'} onClick={() => setActiveEngine('qr')} />
          </div>

          {/* Right Description Card */}
          <div className="md:col-span-2 bg-[#EFE9DF] border border-[#E5DED5] p-8 rounded-3xl min-h-[180px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeEngine === 'voice' && (
                <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <h4 className="font-semibold text-[#171717] text-lg font-devanagari">{t.verifyVoice}</h4>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-devanagari font-light">{t.verifyVoiceDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'doc' && (
                <motion.div key="doc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <h4 className="font-semibold text-[#171717] text-lg font-devanagari">{t.verifyDoc}</h4>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-devanagari font-light">{t.verifyDocDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'img' && (
                <motion.div key="img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <h4 className="font-semibold text-[#171717] text-lg font-devanagari">{t.verifyImg}</h4>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-devanagari font-light">{t.verifyImgDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'vid' && (
                <motion.div key="vid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <h4 className="font-semibold text-[#171717] text-lg font-devanagari">{t.verifyVid}</h4>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-devanagari font-light">{t.verifyVidDesc}</p>
                </motion.div>
              )}
              {activeEngine === 'qr' && (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <h4 className="font-semibold text-[#171717] text-lg font-devanagari">{t.verifyQr}</h4>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-devanagari font-light">{t.verifyQrDesc}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 7: Outcome explanation */}
      <section className="bg-[#EFE9DF] py-28 border-t border-b border-[#E5DED5] text-[#171717]">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <span className="text-[10px] font-bold tracking-widest text-[#556B2F] uppercase block">Clarity Over Forensics</span>
          <h3 className="text-xl sm:text-2xl font-light text-[#5F5F5F] leading-normal font-devanagari">
            "{t.outcomeTitle}"
          </h3>
          <p className="text-sm font-semibold text-[#171717] font-devanagari">
            {t.outcomeDesc}
          </p>
        </div>
      </section>

      {/* Section 8: Final CTA */}
      <section className="max-w-3xl mx-auto px-6 py-28 text-center space-y-8 font-devanagari">
        <h3 className="text-3xl sm:text-4xl font-normal text-[#171717]">{t.finalTitle}</h3>
        <p className="text-[#5F5F5F] text-base font-light">{t.finalSub}</p>
        <button 
          onClick={() => setActiveTab('auth_signup')}
          className="bg-[#171717] hover:bg-[#2A2A2A] text-white font-bold py-4 px-10 rounded-2xl transition duration-150 text-xs shadow-md min-h-[44px]"
        >
          {t.finalButton}
        </button>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-[#E5DED5] py-12 text-center text-xs text-[#5F5F5F] space-y-4 max-w-5xl mx-auto font-devanagari">
        <p>{t.footerText}</p>
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

interface ScenarioCardProps {
  number: string;
  title: string;
  desc: string;
}

function ScenarioCard({ number, title, desc }: ScenarioCardProps) {
  return (
    <div className="bg-white border border-[#E5DED5] p-8 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition duration-300">
      <span className="font-mono text-xs font-bold text-[#B45309] block">{number}</span>
      <h4 className="font-semibold text-[#171717] text-base leading-snug">{title}</h4>
      <p className="text-[#5F5F5F] text-xs leading-relaxed font-light">{desc}</p>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-xs transition font-devanagari focus:outline-none ${
        active 
          ? 'bg-[#171717] text-white shadow-sm' 
          : 'text-[#5F5F5F] hover:bg-[#F6F3EE] hover:text-[#171717]'
      }`}
    >
      {label}
    </button>
  );
}
