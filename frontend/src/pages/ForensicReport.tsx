import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Logo from '../components/Logo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Local Mock Scam Cases Dataset representing 30 educational files
const getMockScamReport = (id: string) => {
  const num = parseInt(id.replace('mock_case_', ''));
  const categories = ['image', 'voice', 'document', 'website', 'email', 'qr', 'link'];
  const mediaType = categories[(num - 1) % categories.length];
  const verdict = num % 3 === 0 ? 'safe' : (num % 3 === 1 ? 'manipulated' : 'suspicious');
  const score = verdict === 'safe' ? 92 : (verdict === 'suspicious' ? 62 : 15);
  
  const titles = [
    'Fake HR Offer Letter - HDFC Bank',
    'Deepfake CEO Voice Message',
    'AI-Generated Aadhaar Card Scan',
    'Edited Payment Screenshot (Google Pay)',
    'Fake PAN Card Identity Scan',
    'AI-Generated Passport Photograph',
    'Deepfake Political Election Speech',
    'Fake Vendor Invoice - HCL Solutions',
    'Fake Bank Statement - SBI Savings',
    'AI-Generated Selfie KYC Verification',
    'Fake Flight Ticket PDF - IndiGo',
    'Spoofed India Post Courier Address Link',
    'Fake Income Tax Notice (ITR)',
    'Lookalike Banking Portal - ICICI Security',
    'Fake GPay Cashback Reward QR Sticker',
    'Fake Job Selection Mail - Tech Mahindra',
    'AI Cloned Voicemail - Child Emergency',
    'Fake Salary Slip - Infosys Ltd',
    'Fake Rent Receipt - Housing Claim',
    'Fake Electricity Bill - Disconnection warning',
    'AI Celebrity Investment Video Endorsement',
    'Spoofed customer care verification portal',
    'Fake electricity bill SMS Link',
    'Fake rewards coupon link',
    'Deepfake customer service audio verification',
    'AI-Generated corporate profile avatar',
    'Edited merit certificate PDF',
    'Fake donation receipt verification',
    'Spoofed delivery tracking email headers',
    'Fake crypto trading deposit page'
  ];
  
  const caseTitle = titles[num - 1] || `Demo Case File ${num}`;

  return {
    report: {
      _id: id,
      fileName: caseTitle,
      fileUrl: `mock-downloads/demo_file_${num}`,
      mediaType,
      authenticityScore: score,
      riskScore: 100 - score,
      verdict,
      aiExplanation: `Forensic check completed for ${caseTitle}. Diagnostic scanner verified metadata tags, double compression matrix offsets, and checked phishing blacklist records.`,
      anomalies: verdict !== 'safe' ? ['Anomaly detected in header byte structure', 'Mismatch in credentials signature block'] : [],
      createdAt: new Date(Date.now() - num * 3600000).toISOString()
    },
    details: {
      domain: `secure-pay-verification-update-${num}.net`,
      spf: 'FAIL',
      dkim: 'FAIL',
      dmarc: 'FAIL',
      senderIp: '198.51.100.82',
      decodedText: `http://bit.ly/collect-refund-${num}`,
      expandedUrl: `https://scam-axis-login-collect-${num}.com`,
      reputationScore: score,
      ocrConsistency: 'Altered layers detected in layout boundaries',
      extractedText: 'Dear customer, enter UPI code to claim immediate reward money...',
      httpsAvailable: false,
      sslValid: false,
      domainAge: '3 days ago',
      registrar: 'Freenom Inc.',
      suspiciousKeywords: ['gpay', 'pay', 'bonus'],
      homographPatterns: true,
      redirectChain: [`http://bit.ly/collect-refund-${num}`, `https://scam-axis-login-collect-${num}.com`],
      shortenedUrl: true,
      sender: 'google-verification-pay@secure-mail-gateway.net',
      recipient: 'investigator@company.com',
      subject: 'Security Alert: Update Pay Method',
      replyToMismatch: true,
      displayNameSpoofing: true,
      suspiciousAttachments: ['caution_payload.exe'],
      maliciousLinks: [`https://scam-axis-login-collect-${num}.com`],
      headers: [
        { key: 'From', value: 'Google Security <google-verification-pay@secure-mail-gateway.net>' },
        { key: 'To', value: 'investigator@company.com' }
      ]
    }
  };
};

interface ForensicReportProps {
  reportId?: string;
}

export default function ForensicReport({ reportId }: ForensicReportProps) {
  const { token, setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaFilter, setMediaTypeFilter] = useState('all');
  const [verdictFilter, setVerdictFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [sliderPosition, setSliderPosition] = useState(50);
  const [showNonTech, setShowNonTech] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // QUERY FOR REPORT LIST (List Mode)
  const { data: reports = [], refetch: refetchReports, isLoading: loadingList } = useQuery<any[]>({
    queryKey: ['reportsList', mediaFilter, verdictFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (mediaFilter !== 'all') params.append('mediaType', mediaFilter);
      if (verdictFilter !== 'all') params.append('verdict', verdictFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reports list');
      return response.json();
    },
    enabled: !reportId
  });

  // QUERY FOR SINGLE REPORT DETAIL (Detail Mode)
  const { data: reportDetail, isLoading: loadingDetail } = useQuery<any>({
    queryKey: ['reportDetail', reportId],
    queryFn: async () => {
      if (reportId && reportId.startsWith('mock_case_')) {
        return getMockScamReport(reportId);
      }
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch report details');
      return response.json();
    },
    enabled: !!reportId
  });

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this report?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['reportsList'] });
        if (reportId) setActiveTab('reports');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/report/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Forensic share URL copied to clipboard!');
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/reports/${id}/favorite`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['reportsList'] });
        queryClient.invalidateQueries({ queryKey: ['reportDetail', id] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadForensicPDF = async () => {
    const element = document.getElementById('forensic-report-render');
    if (!element || !reportDetail) return;
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#FFFDF9',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`PARAKH-Report-${reportDetail.report.fileName}.pdf`);
    } catch (err) {
      alert('Error rendering PDF report file.');
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'highestScore') return b.authenticityScore - a.authenticityScore;
    if (sortBy === 'lowestScore') return a.authenticityScore - b.authenticityScore;
    return 0;
  });

  if (reportId) {
    if (loadingDetail) {
      return <div className="p-8 text-center text-brand-400">Loading audit report details...</div>;
    }
    if (!reportDetail) {
      return <div className="p-8 text-center text-accent-red font-bold">Forensic report not found.</div>;
    }

    const { report, details } = reportDetail;
    const isSafe = report.verdict === 'safe';
    const isSusp = report.verdict === 'suspicious';
    const trustBlocks = Math.round(report.authenticityScore / 10);
    const emptyBlocks = 10 - trustBlocks;

    return (
      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <button onClick={() => setActiveTab('reports')} className="text-brand-500 hover:text-brand-800 text-xs font-bold flex items-center gap-1.5 focus:outline-none">
            <span>←</span> Back to ledger
          </button>
          <div className="flex gap-2">
            <button onClick={downloadForensicPDF} className="bg-accent-blue text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition hover:bg-blue-700">
              💾 Export PDF
            </button>
          </div>
        </div>

        <div id="forensic-report-render" className="bg-[#FFFDF9] border border-brand-200 rounded-3xl p-8 shadow-2xl space-y-8 text-brand-800">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-brand-200 pb-6">
            <Logo className="w-36 h-auto" showTagline={true} />
            <div className="text-right text-xs">
              <p className="font-bold text-brand-500 uppercase">Case Credentials</p>
              <p>ID: <span className="font-mono text-brand-650">{report._id}</span></p>
              <p>Date: <span className="text-brand-650">{new Date(report.createdAt).toLocaleString()}</span></p>
            </div>
          </div>

          {/* Verdict Card */}
          <div className="bg-white border border-brand-250 p-6 rounded-2xl text-center space-y-2 relative">
            <button onClick={(e) => handleToggleFavorite(report._id, e)} className="absolute top-4 right-4 text-lg" title="Toggle Favorite">
              {report.isFavorite ? '⭐' : '☆'}
            </button>
            <span className="text-4xl">{isSafe ? '✅' : (isSusp ? '⚠️' : '🚨')}</span>
            <h2 className={`text-2xl font-black ${isSafe ? 'text-accent-green' : (isSusp ? 'text-accent-amber' : 'text-accent-red')}`}>
              {isSafe ? 'Likely Authentic' : (isSusp ? 'Needs Manual Review' : 'Highly Suspicious')}
            </h2>
            <p className="text-xs text-brand-500 uppercase tracking-widest font-bold">Trust Score: {report.authenticityScore}%</p>
          </div>

          {/* Trust Meter Block */}
          <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-500 block">Trust Matrix Indicator</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-2xl tracking-tighter text-brand-850">
                {"█".repeat(trustBlocks)}{"░".repeat(emptyBlocks)}
              </span>
              <span className={`text-xs font-black uppercase tracking-wider ${isSafe ? 'text-accent-green' : (isSusp ? 'text-accent-amber' : 'text-accent-red')}`}>
                {isSafe ? 'High Trust' : (isSusp ? 'Moderate Risk' : 'High Threat')}
              </span>
            </div>
            <p className="text-xs text-brand-700 leading-relaxed font-medium">{report.aiExplanation}</p>
          </div>

          {/* Content Details Switcher per type */}
          {report.mediaType === 'website' && details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-white border border-brand-200 p-5 rounded-2xl space-y-2.5">
                <h4 className="font-bold text-brand-800 uppercase tracking-wider">Domain Records</h4>
                <div className="flex justify-between"><span>Registrar:</span><span className="font-bold">{details.registrar}</span></div>
                <div className="flex justify-between"><span>Domain Age:</span><span className="font-bold">{details.domainAge}</span></div>
                <div className="flex justify-between"><span>HTTPS:</span><span className="font-bold text-accent-green">{details.httpsAvailable ? 'Yes' : 'No'}</span></div>
              </div>
              <div className="bg-white border border-brand-200 p-5 rounded-2xl space-y-2.5">
                <h4 className="font-bold text-brand-800 uppercase tracking-wider">Redirect chains</h4>
                {details.redirectChain?.map((r: string, i: number) => (
                  <div key={i} className="bg-brand-50 p-2 rounded-xl truncate">↳ {r}</div>
                ))}
              </div>
            </div>
          )}

          {report.mediaType === 'email' && details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-white border border-brand-200 p-5 rounded-2xl space-y-2">
                <h4 className="font-bold text-brand-800 uppercase tracking-wider">Header Alignments</h4>
                <div className="flex justify-between"><span>SPF:</span><span className="font-bold text-accent-green">{details.spf}</span></div>
                <div className="flex justify-between"><span>DKIM:</span><span className="font-bold text-accent-green">{details.dkim}</span></div>
                <div className="flex justify-between"><span>DMARC:</span><span className="font-bold text-accent-green">{details.dmarc}</span></div>
                <div className="flex justify-between"><span>Sender IP:</span><span className="font-bold">{details.senderIp}</span></div>
              </div>
              <div className="bg-white border border-brand-200 p-5 rounded-2xl space-y-2">
                <h4 className="font-bold text-brand-800 uppercase tracking-wider">Spoofing Indicators</h4>
                <div className="flex justify-between"><span>Display Name Spoof:</span><span className="font-bold text-accent-red">{details.displayNameSpoofing ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span>Reply-To Address Mismatch:</span><span className="font-bold text-accent-red">{details.replyToMismatch ? 'Mismatch' : 'None'}</span></div>
              </div>
            </div>
          )}

          {report.mediaType === 'qr' && details && (
            <div className="bg-white border border-brand-200 p-6 rounded-2xl text-xs space-y-4">
              <h4 className="font-bold text-brand-800 uppercase tracking-wider">Decoded Payload</h4>
              <div>
                <span className="text-brand-500 uppercase block mb-1">Decoded Text:</span>
                <span className="bg-brand-50 p-2.5 rounded-xl block font-mono border border-brand-200 break-all select-all">{details.decodedText}</span>
              </div>
              <div>
                <span className="text-brand-500 uppercase block mb-1">Final Destination:</span>
                <span className="bg-brand-50 p-2.5 rounded-xl block font-mono border border-brand-200 break-all select-all text-accent-blue">{details.expandedUrl}</span>
              </div>
            </div>
          )}

          {report.mediaType === 'link' && details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-white border border-brand-200 p-5 rounded-2xl space-y-3">
                <h4 className="font-bold text-brand-800 uppercase tracking-wider">Link Properties</h4>
                <div className="flex justify-between"><span>Domain:</span><span className="font-bold">{details.domain}</span></div>
                <div className="flex justify-between"><span>SSL Certificate:</span><span className="font-bold text-accent-green">{details.certificateStatus}</span></div>
                <div className="flex justify-between"><span>Malware Risk:</span><span className="font-bold text-accent-red">{details.malwareProbability}%</span></div>
              </div>
              <div className="bg-white border border-brand-200 p-5 rounded-2xl space-y-2">
                <h4 className="font-bold text-brand-800 uppercase tracking-wider">Tracking Pixels Scanned</h4>
                {details.trackingDetection?.map((tr: string, i: number) => (
                  <span key={i} className="inline-block bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-md mr-1.5">{tr}</span>
                ))}
              </div>
            </div>
          )}

          {report.mediaType === 'voice' && details && (
            <div className="bg-white border border-brand-200 p-6 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold text-brand-850 uppercase tracking-wider">Voice Biometrics</h4>
              <p>Claimed Speaker Match: <span className="font-bold">{details.matchedMemberId?.name || 'Unknown'}</span></p>
              <p>Similarity Confidence: <span className="font-bold">{details.similarityScore ? `${Math.round(details.similarityScore * 100)}%` : 'N/A'}</span></p>
            </div>
          )}

          {report.mediaType === 'document' && details && (
            <div className="bg-white border border-brand-200 p-6 rounded-2xl text-xs space-y-3">
              <h4 className="font-bold text-brand-850 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-brand-100">
                <span>📄</span> Document Integrity Diagnostics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <p className="font-semibold text-brand-500">Structural Auditing:</p>
                  <p>OCR Layer Consistency: <span className="font-bold">{details.ocrConsistency}</span></p>
                  <p>Digital Signature Block: <span className="font-bold">{details.signaturePresence}</span></p>
                  <p className="truncate">Extracted Text Snippet: <span className="font-bold italic">"{details.extractedText}"</span></p>
                </div>
                {details.metadata && details.metadata.isInternshipDoc && (
                  <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl space-y-1.5">
                    <div className="font-bold text-brand-850 uppercase text-[9px] tracking-wider mb-1 flex items-center gap-1">
                      <span>🎓</span> Internship Certificate / Document Audit
                    </div>
                    <p>Verified Recipient: <span className="font-bold text-brand-900">{details.metadata.recipientName}</span></p>
                    <p>Name Alignment: <span className={`font-bold ${details.metadata.nameVerified === 'Verified Match' ? 'text-accent-green' : 'text-accent-amber'}`}>{details.metadata.nameVerified}</span></p>
                    <p>Issuing Organisation: <span className="font-bold text-brand-900">{details.metadata.organization}</span></p>
                    <p>Signature Verification: <span className="font-bold text-brand-900">{details.metadata.signaturesVerified}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Reasoning Timeline ("How PARAKH Reached This Verdict") */}
          <div className="bg-brand-50 border border-[#F1EFE9] p-6 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block">How PARAKH Reached This Verdict</span>
            <div className="grid grid-cols-5 text-center relative pt-2">
              <div className="absolute left-[10%] right-[10%] top-6 h-[2px] bg-brand-200 z-0" />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xl bg-white border border-brand-200 p-2.5 rounded-full shadow-sm">📸</span>
                <span className="text-[9px] font-bold text-brand-700 mt-2">Captured</span>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xl bg-white border border-brand-200 p-2.5 rounded-full shadow-sm">✉️</span>
                <span className="text-[9px] font-bold text-brand-700 mt-2">Shared</span>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xl bg-white border border-brand-200 p-2.5 rounded-full shadow-sm">🖥️</span>
                <span className="text-[9px] font-bold text-brand-700 mt-2">Uploaded</span>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xl bg-white border border-brand-200 p-2.5 rounded-full shadow-sm">🔍</span>
                <span className="text-[9px] font-bold text-brand-700 mt-2">Verified</span>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-xl p-2 rounded-full shadow-sm border ${isSafe ? 'bg-accent-green/10 border-accent-green' : (isSusp ? 'bg-accent-amber/10 border-accent-amber' : 'bg-accent-red/10 border-accent-red')}`}>
                  {isSafe ? '✅' : (isSusp ? '⚠️' : '🚨')}
                </span>
                <span className="text-[9px] font-bold text-brand-700 mt-2">Result</span>
              </div>
            </div>
          </div>

          {/* Simple Accordion explainer */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl overflow-hidden">
            <button onClick={() => setShowNonTech(!showNonTech)} className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-brand-800 text-sm hover:bg-brand-100/50 transition">
              <span>🔎 Explain Like I'm Not Technical</span>
              <span>{showNonTech ? '▲' : '▼'}</span>
            </button>
            {showNonTech && (
              <p className="px-6 pb-5 pt-1 border-t border-brand-200 text-xs text-brand-650 leading-relaxed transition bg-white">
                {isSafe 
                  ? 'Everything looks good! We checked this very carefully and didn\'t find any signs of fake images, cloned voices, altered files, or trick links. It is safe to trust.'
                  : isSusp 
                  ? 'Be careful! Some details look a bit unusual or out of place. It might be a minor mistake, or it could be someone trying to trick you. We recommend double-checking directly with the sender before sharing any info.'
                  : 'Alert! This is highly likely to be a scam or fake. We detected signs of computer-generated images, AI voice cloning, forged documents, or trick websites designed to steal your information. Do not trust or share this!'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RENDER REPORT LEDGER LIST (List Mode)
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-brand-800 flex items-center space-x-2">
            <span>📋</span> <span>Forensic Ledger</span>
          </h2>
          <p className="text-brand-500 text-sm mt-1">
            Audit history of verifications completed under this user profile.
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white border border-brand-200 p-5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-grow">
          <input
            type="text"
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-2 text-xs focus:outline-none placeholder-brand-400 transition w-full sm:w-64 text-brand-850"
            placeholder="Search filenames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600 font-bold"
            value={mediaFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value)}
          >
            <option value="all">All Formats</option>
            <option value="voice">🎙️ Voice</option>
            <option value="image">🖼️ Image</option>
            <option value="document">📄 Document</option>
            <option value="website">🌐 Website</option>
            <option value="email">✉️ Email</option>
            <option value="qr">🔍 QR Code</option>
            <option value="link">🔗 Link</option>
          </select>
          <select
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600 font-bold"
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
          >
            <option value="all">All Verdicts</option>
            <option value="safe">✓ Safe</option>
            <option value="suspicious">⚠️ Suspicious</option>
            <option value="manipulated">🚨 Manipulated</option>
          </select>
          <select
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600 font-bold"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highestScore">Sort: High Trust Score</option>
            <option value="lowestScore">Sort: Low Trust Score</option>
          </select>
        </div>
      </div>

      {loadingList ? (
        <div className="text-center py-20 text-brand-400">Loading ledger data...</div>
      ) : sortedReports.length === 0 ? (
        <div className="bg-white border border-brand-200 rounded-3xl p-16 text-center shadow-sm">
          <span className="text-5xl block mb-3">📋</span>
          <h3 className="text-lg font-bold text-brand-850">No forensic records logged</h3>
          <p className="text-xs text-brand-500 mt-1">Audit verification data will accumulate here once ran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedReports.map((report) => (
            <div 
              key={report._id}
              onClick={() => setActiveTab(`report_detail:${report._id}`)}
              className="bg-white border border-brand-200 hover:border-brand-350 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.01] transition duration-200 cursor-pointer group relative"
            >
              <button onClick={(e) => handleToggleFavorite(report._id, e)} className="absolute top-4 right-4 text-base" title="Favorite">
                {report.isFavorite ? '⭐' : '☆'}
              </button>
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                  <h4 className="font-bold text-base text-brand-800 truncate mt-0.5 group-hover:text-accent-blue transition pr-6">
                    {report.fileName}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider shrink-0 ${
                  report.verdict === 'safe'
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                    : (report.verdict === 'suspicious' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20')
                }`}>{report.verdict}</span>
              </div>

              {/* Stats detail */}
              <div className="grid grid-cols-2 gap-2 bg-brand-50 p-3 rounded-xl border border-brand-200 text-xs">
                <div>
                  <span className="text-brand-500 block">Trust Score</span>
                  <span className="font-black text-sm text-brand-800">{report.authenticityScore}%</span>
                </div>
                <div>
                  <span className="text-brand-500 block">Format Type</span>
                  <span className="font-bold text-brand-650 capitalize">{report.mediaType}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center border-t border-brand-200 pt-3">
                <button 
                  onClick={(e) => handleShareReport(report._id, e)}
                  className="text-xs text-brand-505 hover:text-brand-850 font-bold transition px-2 py-1"
                >
                  🔗 Share
                </button>
                <button 
                  onClick={(e) => handleDeleteReport(report._id, e)}
                  className="text-xs text-brand-505 hover:text-accent-red font-bold transition px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
