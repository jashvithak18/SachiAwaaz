import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ForensicReportProps {
  reportId?: string;
}

export default function ForensicReport({ reportId }: ForensicReportProps) {
  const { token, setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaFilter, setMediaTypeFilter] = useState('all');
  const [verdictFilter, setVerdictFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch report details');
      return response.json();
    },
    enabled: !!reportId
  });

  // Sort logic for List Mode
  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'highestScore') return b.authenticityScore - a.authenticityScore;
    if (sortBy === 'lowestScore') return a.authenticityScore - b.authenticityScore;
    return 0;
  });

  // Actions
  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this report? This will remove all verification files.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        refetchReports();
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
    alert('Forensic sharing URL copied to clipboard!');
  };

  // PDF Generation Tool
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
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`PARAKH-Forensic-Report-${reportDetail.report.fileName}.pdf`);
    } catch (err) {
      alert('Error rendering PDF report file.');
    }
  };

  // RENDER REPORT DETAIL (Screen 3)
  if (reportId) {
    if (loadingDetail) {
      return (
        <div className="p-8 text-center text-brand-400">Loading audit report details...</div>
      );
    }
    if (!reportDetail) {
      return (
        <div className="p-8 text-center text-accent-red font-bold">Forensic report not found.</div>
      );
    }

    const { report, details } = reportDetail;
    const isSafe = report.verdict === 'safe';
    const isSusp = report.verdict === 'suspicious';

    return (
      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setActiveTab('reports')}
            className="text-xs font-bold text-brand-500 hover:text-brand-850 transition flex items-center space-x-2"
          >
            <span>&larr;</span> <span>Back to Forensic Ledger</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={downloadForensicPDF}
              className="bg-accent-blue hover:bg-blue-700 text-white font-bold px-4.5 py-2 rounded-xl text-xs transition min-h-[44px]"
            >
              📥 Download PDF Report
            </button>
          </div>
        </div>

        {/* Report Paper Component (Target for PDF Render) */}
        <div id="forensic-report-render" className="bg-[#FFFDF9] border border-brand-200 rounded-3xl p-8 shadow-2xl space-y-8 text-brand-800">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-brand-200 pb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#3E5C4B" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11L11 13L15 9" stroke="#FBFAF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h1 className="text-2xl font-black text-brand-800 tracking-widest leading-none">परख</h1>
                <span className="text-[9px] font-bold text-[#666] tracking-widest uppercase mt-1 block">PARAKH Forensics Unit</span>
              </div>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <p className="text-xs font-bold text-brand-500 uppercase tracking-widest">Report Credentials</p>
              <p className="text-xs text-brand-800">ID: <span className="font-mono text-brand-600">{report._id}</span></p>
              <p className="text-xs text-brand-800">Date: <span className="text-brand-600">{new Date(report.createdAt).toLocaleString()}</span></p>
            </div>
          </div>

          {/* Core metadata details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-100 p-5 rounded-2xl border border-brand-200 text-sm">
            <div className="space-y-2">
              <p className="text-brand-500 text-xs uppercase font-bold tracking-wider font-sans">Evidence File Details</p>
              <p className="text-brand-800 font-black">{report.fileName}</p>
              <p className="text-xs capitalize text-brand-600">Format: {report.mediaType}</p>
            </div>
            <div className="space-y-2 text-left md:text-right">
              <p className="text-brand-500 text-xs uppercase font-bold tracking-wider font-sans">Classification Verdict</p>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider ${
                  isSafe ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : (isSusp ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20')
                }`}>{report.verdict}</span>
              </div>
            </div>
          </div>

          {/* Scores details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Authenticity card */}
            <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Authenticity Score</span>
                <p className={`text-5xl font-black mt-2 ${
                  report.authenticityScore >= 75 ? 'text-accent-green' : (report.authenticityScore >= 45 ? 'text-accent-amber' : 'text-accent-red')
                }`}>{report.authenticityScore}%</p>
              </div>
              <p className="text-[10px] text-brand-500 mt-4 leading-normal">
                Indicates the percentage probability of real, biological, or unaltered composition.
              </p>
            </div>

            {/* Risk Meter card */}
            <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Manipulation / Risk Score</span>
                <p className={`text-5xl font-black mt-2 ${
                  report.riskScore >= 55 ? 'text-accent-red' : (report.riskScore >= 25 ? 'text-accent-amber' : 'text-accent-green')
                }`}>{report.riskScore}%</p>
              </div>
              <div className="w-full bg-brand-200 h-2.5 rounded-full mt-4">
                <div 
                  className={`h-2.5 rounded-full ${
                    report.riskScore >= 55 ? 'bg-accent-red' : (report.riskScore >= 25 ? 'bg-accent-amber' : 'bg-accent-green')
                  }`}
                  style={{ width: `${report.riskScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* AI Reasoning explanation */}
          <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-brand-850 text-sm uppercase tracking-wider">AI Forensic Explanation</h3>
            <p className="text-brand-700 text-sm leading-relaxed">{report.aiExplanation}</p>
          </div>

          {/* Anomalies List */}
          {report.anomalies.length > 0 && (
            <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl space-y-3">
              <h3 className="font-bold text-brand-850 text-sm uppercase tracking-wider text-accent-red">Detected Forensic Anomalies</h3>
              <ul className="space-y-2 text-xs">
                {report.anomalies.map((anom: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-accent-red">⚠️</span>
                    <span className="text-brand-650 leading-normal">{anom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Module Specific Data */}
          {report.mediaType === 'voice' && details && (
            <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-brand-800 text-sm uppercase tracking-wider border-b border-brand-200 pb-2">Biometric Speaker Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-brand-550 font-bold uppercase">Claimed Speaker Match</p>
                  <p className="text-brand-800 font-bold text-sm mt-1">{details.matchedMemberId ? `${details.matchedMemberId.name} (${details.matchedMemberId.relationship})` : 'Unknown Speaker'}</p>
                </div>
                <div>
                  <p className="text-brand-550 font-bold uppercase">Similarity Confidence</p>
                  <p className="text-brand-800 font-bold text-sm mt-1">{details.similarityScore !== null ? `${Math.round(details.similarityScore * 100)}%` : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {report.mediaType === 'image' && details && (
            <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-brand-800 text-sm uppercase tracking-wider border-b border-brand-200 pb-2">Image Matrix Forensics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <p className="text-brand-500 uppercase font-bold">Metadata Structures</p>
                  <pre className="bg-brand-100 p-3 rounded-xl border border-brand-200 text-brand-650 font-mono text-[10px] overflow-x-auto">
                    {JSON.stringify(details.metadata, null, 2)}
                  </pre>
                </div>
                <div className="space-y-3">
                  <p className="text-brand-500 uppercase font-bold">Heuristic Indicators</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Compression Quantization Risk</span>
                      <span className="font-bold text-brand-800">{details.compressionArtifactsScore}%</span>
                    </div>
                    <div className="w-full bg-brand-200 h-1.5 rounded-full">
                      <div className="bg-accent-blue h-1.5 rounded-full" style={{ width: `${details.compressionArtifactsScore}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Generative AI Probability</span>
                      <span className="font-bold text-brand-800">{details.aiGenerationScore}%</span>
                    </div>
                    <div className="w-full bg-brand-200 h-1.5 rounded-full">
                      <div className="bg-accent-blue h-1.5 rounded-full" style={{ width: `${details.aiGenerationScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {report.mediaType === 'document' && details && (
            <div className="bg-brand-50 border border-brand-200 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-brand-800 text-sm uppercase tracking-wider border-b border-brand-200 pb-2">Document Structure Auditing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <p className="text-brand-500 font-bold uppercase">OCR Layer Consistency</p>
                    <p className="text-brand-850 mt-1">{details.ocrConsistency}</p>
                  </div>
                  <div>
                    <p className="text-brand-500 font-bold uppercase">Signature Presence Check</p>
                    <p className="text-brand-850 mt-1">{details.signaturePresence}</p>
                  </div>
                  <div>
                    <p className="text-brand-500 font-bold uppercase">Structural Manipulation Warnings</p>
                    <p className="text-brand-850 mt-1">{details.possibleManipulation}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-brand-500 uppercase font-bold font-sans">Extracted Text Stream Summary</p>
                  <p className="p-3 bg-brand-100 border border-brand-200 rounded-xl text-brand-650 italic text-[11px] leading-relaxed">
                    "{details.extractedText}"
                  </p>
                </div>
              </div>
            </div>
          )}

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
            Chronological audit history of media verifications completed under this user profile.
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white border border-brand-200 p-5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-3 items-center flex-grow">
          <input
            type="text"
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-2 text-xs focus:outline-none placeholder-brand-400 transition w-full sm:w-64"
            placeholder="Search filenames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600"
            value={mediaFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value)}
          >
            <option value="all">All Formats</option>
            <option value="voice">🎙️ Voice</option>
            <option value="image">🖼️ Image</option>
            <option value="document">📄 Document</option>
          </select>
          <select
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600"
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
          >
            <option value="all">All Verdicts</option>
            <option value="safe">✓ Safe</option>
            <option value="suspicious">⚠️ Suspicious</option>
            <option value="manipulated">🚨 Manipulated</option>
          </select>
          <select
            className="bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2 text-xs focus:outline-none transition text-brand-600"
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
              className="bg-white border border-brand-200 hover:border-brand-350 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.01] transition duration-200 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                  <h4 className="font-bold text-base text-brand-800 truncate mt-0.5 group-hover:text-accent-blue transition">
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
                  className="text-xs text-brand-500 hover:text-brand-850 font-bold transition px-2 py-1"
                >
                  🔗 Share
                </button>
                <button 
                  onClick={(e) => handleDeleteReport(report._id, e)}
                  className="text-xs text-brand-500 hover:text-accent-red font-bold transition px-2 py-1"
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
