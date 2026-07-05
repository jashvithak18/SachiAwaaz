import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function Landing() {
  const { setActiveTab } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Mouse Parallax movement
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / 30;
    const y = (clientY - innerHeight / 2) / 30;
    setMousePos({ x, y });
  };

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1.5, ease: 'power4.out' }
      );
    }
  }, []);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="bg-brand-100 text-brand-800 min-h-screen font-sans selection:bg-accent-blue/10 overflow-x-hidden relative"
      style={{ backgroundColor: '#FFF8F2' }}
    >
      {/* Decorative luxury gradient ambient spots */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent-blue/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[5%] w-[450px] h-[450px] rounded-full bg-accent-amber/5 blur-[90px] pointer-events-none"></div>

      {/* Top Navigation (Sticky) */}
      <header className="border-b border-brand-200/50 backdrop-blur-md sticky top-0 z-50 bg-white/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left: Logo */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-black text-accent-blue tracking-wider leading-none">परख</h1>
              <span className="text-[9px] font-bold text-accent-amber tracking-widest uppercase mt-0.5 block">PARAKH Platform</span>
            </div>
          </div>

          {/* Center: Menu in Hindi */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-brand-600 font-devanagari">
            <a href="#hero" className="hover:text-accent-blue transition">होम</a>
            <a href="#features" className="hover:text-accent-blue transition">विशेषताएँ</a>
            <a href="#how-it-works" className="hover:text-accent-blue transition">समाधान</a>
            <a href="#use-cases" className="hover:text-accent-blue transition">केस स्टडी</a>
            <a href="#cta" className="hover:text-accent-blue transition">संपर्क करें</a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('auth_login')}
              className="text-xs font-bold text-brand-600 hover:text-brand-900 transition px-4 py-2"
            >
              लॉग इन
            </button>
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="bg-accent-blue hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-accent-blue/15"
            >
              शुरू करें
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        id="hero"
        className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]"
      >
        {/* Left Content */}
        <div className="space-y-8 text-left">
          <div className="inline-flex items-center space-x-2.5 bg-accent-blue/5 border border-accent-blue/10 px-4 py-1.5 rounded-full text-[10px] font-bold text-accent-blue uppercase tracking-widest shadow-sm">
            <span>🛡️ AI EVIDENCE FORENSIC PLATFORM</span>
          </div>

          <h2 
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-black font-devanagari text-brand-900 leading-tight tracking-tight"
          >
            हर डिजिटल प्रमाण की परख। <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-amber bg-clip-text text-transparent">
              हर सच की पुष्टि।
            </span>
          </h2>
          
          <p className="text-brand-500 text-sm sm:text-base leading-relaxed max-w-xl font-devanagari">
            AI की मदद से आवाज़, तस्वीर, दस्तावेज़ और वीडियो की प्रमाणिकता की जाँच करें और जाली पहचान का पर्दाफ़ाश करें।
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => setActiveTab('auth_signup')}
              className="w-full sm:w-auto bg-accent-blue hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition duration-150 text-xs shadow-lg shadow-accent-blue/15 min-h-[44px] font-devanagari"
            >
              सबूत की जाँच करें
            </button>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto border border-brand-300 hover:bg-white text-brand-650 hover:text-brand-800 font-semibold py-3.5 px-8 rounded-xl transition text-xs text-center min-h-[44px] block font-devanagari"
            >
              कैसे काम करता है?
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-brand-200 grid grid-cols-3 gap-4 text-xs font-devanagari">
            <div className="flex items-center space-x-2">
              <span className="text-accent-blue font-bold">✓</span>
              <span className="text-brand-600">50K+ केस जांचे गए</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-accent-blue font-bold">✓</span>
              <span className="text-brand-600">98.7% सटीकता</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-accent-blue font-bold">✓</span>
              <span className="text-brand-600">24/7 सुरक्षित और गोपनीय</span>
            </div>
          </div>
        </div>

        {/* Right Visual: 3D-ish Dashboard Mockup */}
        <div className="relative h-[400px] w-full flex items-center justify-center pointer-events-none select-none">
          <div 
            className="absolute w-40 h-40 rounded-full bg-accent-blue/10 blur-3xl transition duration-355"
            style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
          ></div>
          <div 
            className="absolute text-8xl z-20 animate-bounce"
            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
          >
            🛡️
          </div>

          {/* Voice analysis card */}
          <div 
            className="absolute top-[10%] left-[5%] bg-white border border-brand-200 p-4 rounded-2xl shadow-xl w-48 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px) rotate(-3deg)` }}
          >
            <p className="text-[10px] font-bold text-accent-blue uppercase">🎙️ Voice analysis</p>
            <p className="text-xs font-black text-brand-800 mt-1">Biometric Waveform</p>
            <div className="flex items-center space-x-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-ping"></span>
              <span className="text-[9px] text-brand-500">98.7% Real Speech</span>
            </div>
          </div>

          {/* Image card */}
          <div 
            className="absolute bottom-[15%] left-[5%] bg-white border border-brand-200 p-4 rounded-2xl shadow-xl w-44 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * -0.8}px) rotate(4deg)` }}
          >
            <p className="text-[10px] font-bold text-accent-amber uppercase">🖼️ Image authenticity</p>
            <p className="text-xs font-black text-accent-red mt-1">Altered metadata</p>
            <span className="text-[8px] bg-accent-red/10 text-accent-red px-2 py-0.5 rounded-full font-bold mt-2 inline-block">Quantized</span>
          </div>

          {/* Document card */}
          <div 
            className="absolute top-[20%] right-[5%] bg-white border border-brand-200 p-4 rounded-2xl shadow-xl w-48 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * 0.7}px) rotate(2deg)` }}
          >
            <p className="text-[10px] font-bold text-accent-teal uppercase">📄 Document forensics</p>
            <p className="text-xs font-black text-brand-800 mt-1">Signature Matched</p>
            <div className="w-full bg-brand-200 h-1.5 rounded-full mt-2">
              <div className="bg-accent-teal h-1.5 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          {/* Video analysis card */}
          <div 
            className="absolute bottom-[5%] right-[10%] bg-white border border-brand-200 p-4 rounded-2xl shadow-xl w-40 transition-transform duration-200"
            style={{ transform: `translate(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px) rotate(-5deg)` }}
          >
            <p className="text-[9px] font-bold text-brand-400 uppercase">📽️ Video analysis</p>
            <p className="text-2xl font-black text-accent-blue mt-1">98%</p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Platform capabilities</span>
          <h3 className="text-3xl font-black text-brand-850 font-devanagari mt-2">
            परख की शक्तिशाली विशेषताएँ
          </h3>
          <p className="text-brand-500 text-sm max-w-xl mx-auto mt-2 font-devanagari">
            गहराई से जानें, सटीक परिणाम पायें
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon="🎙️" title="आवाज़ विश्लेषण (Voice Analysis)" desc="बायोमेट्रिक मिलान और पिच विश्लेषण के द्वारा डीपफेक और वॉयस क्लोनिंग का पता लगाएं।" />
          <FeatureCard icon="📄" title="दस्तावेज़ सत्यापन (Document Forensics)" desc="PDF संरचना, क्रिएटर हिस्ट्री, और टेक्स्ट अलाइनमेंट के साथ छेड़छाड़ की जाँच करें।" />
          <FeatureCard icon="🖼️" title="छवि प्रामाणिकता (Image Authentication)" desc="डबल कंप्रेशन आर्टिफैक्ट्स और अवांछित संपादन निशानों की पहचान करें।" />
          <FeatureCard icon="📽️" title="वीडियो विश्लेषण (Video Analysis)" desc="फ्रेम-बाय-फ्रेम विसंगति और लिप-सिंक हेरफेर का व्यापक विश्लेषण।" />
          <FeatureCard icon="🧬" title="बायोमेट्रिक मेल (Biometric Match)" desc="सुरक्षित व्यक्तिगत बायोमेट्रिक हस्ताक्षरों का उपयोग कर वॉयस प्रोफाइल मैचिंग।" />
          <FeatureCard icon="🔑" title="क्रिप्टोग्राफिक जाँच (Cryptographic Check)" desc="दस्तावेजों में एम्बेडेड सुरक्षा प्रमाण पत्र और डिजिटल हस्ताक्षर जांचें।" />
        </div>
      </section>

      {/* How It Works (Steps) */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-teal uppercase tracking-widest">Process Flow</span>
          <h3 className="text-3xl font-black text-brand-850 font-devanagari mt-2">परख कैसे काम करता है?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative font-devanagari">
          <WorkflowStep number="1" title="सबूत अपलोड करें" desc="जांच वाली आवाज़, दस्तावेज़ या छवि अपलोड करें।" />
          <WorkflowStep number="2" title="AI विश्लेषण" desc="हमारा डीप-लर्निंग मॉडल विसंगतियों की स्कैनिंग करता है।" />
          <WorkflowStep number="3" title="सत्यापन और मिलान" desc="बायोमेट्रिक हस्ताक्षरों और संपादन निशानों की जाँच की जाती है।" />
          <WorkflowStep number="4" title="विस्तृत रिपोर्ट प्राप्त करें" desc="क्रिप्टोग्राफिक रूप से हस्ताक्षरित पीडीएफ रिपोर्ट डाउनलोड करें।" />
        </div>
      </section>

      {/* Use Cases / Who It's For */}
      <section id="use-cases" className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-amber uppercase tracking-widest">Target Audience</span>
          <h3 className="text-3xl font-black text-brand-850 font-devanagari mt-2">किसके लिए परख?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 text-center font-devanagari">
          <UseCaseCard icon="⚖️" title="पुलिस और जांच एजेंसियां" />
          <UseCaseCard icon="💼" title="कानूनी विशेषज्ञ" />
          <UseCaseCard icon="🏢" title="कॉर्पोरेट सुरक्षा टीमें" />
          <UseCaseCard icon="🔬" title="फॉरेंसिक प्रोफेशनल्स" />
          <UseCaseCard icon="🏦" title="बीमा और बैंकिंग क्षेत्र" />
        </div>
      </section>

      {/* Case Study / Stats Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center font-devanagari">
          {/* Left stats */}
          <div className="space-y-8">
            <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Platform Records</span>
            <div className="space-y-6">
              <div>
                <span className="text-5xl font-black text-accent-blue">1,25,000+</span>
                <p className="text-sm font-bold text-brand-800 mt-1">सबूतों की जांच</p>
              </div>
              <div className="border-t border-brand-200 pt-4">
                <span className="text-5xl font-black text-accent-blue">98.7%</span>
                <p className="text-sm font-bold text-brand-800 mt-1">सटीकता दर</p>
              </div>
              <div className="border-t border-brand-200 pt-4">
                <span className="text-5xl font-black text-accent-blue">75+</span>
                <p className="text-sm font-bold text-brand-800 mt-1">संस्थानों का विश्वास</p>
              </div>
            </div>
          </div>

          {/* Right Case study card */}
          <div className="bg-white border border-brand-200 p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="bg-accent-blue/10 text-accent-blue px-2.5 py-1 rounded-full font-bold">Case Study #201</span>
              <span className="text-brand-500">2026</span>
            </div>
            <h4 className="font-bold text-brand-850 text-lg">वॉयस क्लोनिंग घोटाला पहचान</h4>
            <p className="text-brand-550 text-xs leading-relaxed">
              एक प्रमुख वित्तीय संस्थान को भेजी गई आपातकालीन वॉयस नोट की परख की गई। बायोमेट्रिक मिलान में 42% समानता मिली, जिससे एक बड़ी धोखाधड़ी रोकी गई।
            </p>
            <div className="border-t border-brand-200 pt-4 flex justify-between items-center text-xs">
              <span className="font-bold text-brand-800">Result Metric:</span>
              <span className="text-accent-teal font-black">₹50 लाख+ की बचत</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Quotes */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-brand-200/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Reviews</span>
          <h3 className="text-3xl font-black text-brand-850 font-devanagari mt-2">वे हमारे बारे में क्या कहते हैं</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-devanagari">
          <TestimonialCard 
            quote="परख ने हमारे कानूनी दस्तावेजों की प्रमाणिकता जांचने में मदद की। सटीक क्वांटाइजेशन रिपोर्ट अविश्वसनीय है।" 
            author="डॉ. विकास शर्मा" 
            role="फॉरेंसिक विशेषज्ञ" 
            org="फॉरेंसिक लैब इंडिया" 
          />
          <TestimonialCard 
            quote="बायोमेट्रिक वॉयस चेकर घोटाला कॉल्स को रोकने के लिए सबसे विश्वसनीय सुरक्षा कवच है। अद्भुत डिज़ाइन।" 
            author="श्रीमती रेणुका" 
            role="मुख्य सुरक्षा अधिकारी" 
            org="ग्लोबल फिनटेक कॉर्प" 
          />
          <TestimonialCard 
            quote="दस्तावेज़ और छवि मेटाडाटा अलाइनमेंट जांच बेहद तेज़ी से होती है। SaaS इंटरफ़ेस बेहद ही शानदार है।" 
            author="राजेश मल्होत्रा" 
            role="वरिष्ठ अधिवक्ता" 
            org="मल्होत्रा एंड एसोसिएट्स" 
          />
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="bg-gradient-to-br from-accent-blue/15 to-accent-amber/5 border-t border-b border-brand-200/50 py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10 font-devanagari">
          <h3 className="text-3xl sm:text-5xl font-black text-brand-900 leading-tight">
            सच की पुष्टि करें, खुद को बेनकाब करें।
          </h3>
          <p className="text-brand-550 text-base max-w-xl mx-auto leading-relaxed">
            परख के साथ डिजिटल फॉरेंसिक की नई पहचान बनायें।
          </p>
          <button 
            onClick={() => setActiveTab('auth_signup')}
            className="bg-white hover:bg-brand-100 text-accent-blue font-bold py-3.5 px-8 rounded-xl transition duration-150 text-xs shadow-md border border-brand-200 min-h-[44px]"
          >
            अभी शुरू करें
          </button>
        </div>
      </section>

      {/* Footer / Bottom Bar */}
      <footer className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-brand-500 text-xs font-devanagari">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold text-accent-blue tracking-widest uppercase">परख</span>
        </div>
        <p>© 2025 PARAKH. सभी अधिकार सुरक्षित हैं</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-brand-850 transition">गोपनीयता नीति</a>
          <span>|</span>
          <a href="#" className="hover:text-brand-850 transition">उपयोग की शर्तें</a>
          <span>|</span>
          <a href="#" className="hover:text-brand-850 transition">संपर्क करें</a>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white border border-brand-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300 group cursor-pointer font-devanagari">
      <span className="text-3xl block mb-4 group-hover:scale-110 transition duration-300">{icon}</span>
      <h4 className="text-base font-black text-brand-800 mb-2">{title}</h4>
      <p className="text-brand-500 text-xs leading-relaxed">{desc}</p>
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

interface UseCaseCardProps {
  icon: string;
  title: string;
}

function UseCaseCard({ icon, title }: UseCaseCardProps) {
  return (
    <div className="bg-white border border-brand-200 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-2 hover:border-accent-blue/30 transition duration-200">
      <span className="text-3xl">{icon}</span>
      <span className="text-xs font-bold text-brand-800">{title}</span>
    </div>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  org: string;
}

function TestimonialCard({ quote, author, role, org }: TestimonialCardProps) {
  return (
    <div className="bg-white border border-brand-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
      <p className="text-brand-600 text-xs italic leading-relaxed">"{quote}"</p>
      <div className="pt-2 border-t border-brand-100">
        <p className="font-bold text-brand-800 text-xs">{author}</p>
        <p className="text-[10px] text-brand-500">{role}, {org}</p>
      </div>
    </div>
  );
}
