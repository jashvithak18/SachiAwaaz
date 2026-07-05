import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CaseWorkspaceProps {
  caseId?: string;
}

interface Report {
  _id: string;
  fileName: string;
  fileUrl: string;
  mediaType: 'voice' | 'image' | 'document';
  authenticityScore: number;
  riskScore: number;
  verdict: 'safe' | 'suspicious' | 'manipulated';
  aiExplanation: string;
  anomalies: string[];
  createdAt: string;
}

interface Case {
  _id: string;
  title: string;
  description: string;
  reports: Report[];
  status: 'active' | 'closed';
  createdAt: string;
}

export default function CaseWorkspace({ caseId }: CaseWorkspaceProps) {
  const { token, setActiveTab } = useStore();
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // 1. QUERY FOR LIST OF CASES
  const { data: cases = [], refetch: refetchCases, isLoading: loadingList } = useQuery<Case[]>({
    queryKey: ['casesList'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cases list');
      return response.json();
    },
    enabled: !caseId
  });

  // 2. QUERY FOR SINGLE CASE DETAIL
  const { data: caseDetail, refetch: refetchCaseDetail, isLoading: loadingDetail } = useQuery<Case>({
    queryKey: ['caseDetail', caseId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch case details');
      return response.json();
    },
    enabled: !!caseId
  });

  // 3. QUERY FOR USER'S REPORTS (To link them to this case)
  const { data: allReports = [] } = useQuery<Report[]>({
    queryKey: ['userReportsList'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch user reports');
      return response.json();
    },
    enabled: !!caseId
  });

  // Create new case handler
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch(`${API_URL}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, description: newDescription })
      });

      if (response.ok) {
        setNewTitle('');
        setNewDescription('');
        refetchCases();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Add existing report to case handler
  const handleLinkReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !caseId) return;

    setIsLinking(true);
    try {
      const response = await fetch(`${API_URL}/cases/${caseId}/add-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportId: selectedReportId })
      });

      if (response.ok) {
        setSelectedReportId('');
        refetchCaseDetail();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Link failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLinking(false);
    }
  };

  // Toggle status handler
  const handleToggleStatus = async () => {
    if (!caseDetail) return;
    const nextStatus = caseDetail.status === 'active' ? 'closed' : 'active';
    try {
      await fetch(`${API_URL}/cases/${caseDetail._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      refetchCaseDetail();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete case handler
  const handleDeleteCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this case? Links to reports are broken, but original forensic files remain.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        if (caseId) setActiveTab('cases');
        else refetchCases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PDF Download Case Report
  const downloadCaseReportPDF = async () => {
    const element = document.getElementById('case-report-render');
    if (!element || !caseDetail) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#FFF8F2',
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
      pdf.save(`PARAKH-Case-Report-${caseDetail.title}.pdf`);
    } catch (err) {
      alert('Error rendering PDF case document.');
    }
  };

  // RENDER DETAILED CASE VIEW
  if (caseId) {
    if (loadingDetail) {
      return <div className="p-8 text-center text-brand-400">Loading case details...</div>;
    }
    if (!caseDetail) {
      return <div className="p-8 text-center text-accent-red font-bold">Investigation case not found.</div>;
    }

    const linkedReports = caseDetail.reports || [];
    
    // Aggregated statistics
    const totalLinked = linkedReports.length;
    const avgScore = totalLinked > 0 
      ? Math.round(linkedReports.reduce((acc, r) => acc + r.authenticityScore, 0) / totalLinked)
      : 100;
    
    // Anomaly accumulator
    const allAnomalies = linkedReports.reduce((acc: string[], r) => [...acc, ...r.anomalies], []);

    return (
      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setActiveTab('cases')}
            className="text-xs font-bold text-brand-500 hover:text-brand-800 transition flex items-center space-x-2"
          >
            <span>&larr;</span> <span>Back to Case Workspace</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[44px] ${
                caseDetail.status === 'active' 
                  ? 'bg-brand-200 text-brand-850 hover:bg-brand-300' 
                  : 'bg-accent-teal/15 text-accent-teal hover:bg-accent-teal/25 border border-accent-teal/20'
              }`}
            >
              Status: {caseDetail.status === 'active' ? '📂 Active (Close)' : '✓ Closed (Re-open)'}
            </button>
            {totalLinked > 0 && (
              <button
                onClick={downloadCaseReportPDF}
                className="bg-accent-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm min-h-[44px]"
              >
                📥 Export Case PDF
              </button>
            )}
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Case Summary (PDF Target Content) */}
          <div className="lg:col-span-2 space-y-6">
            <div id="case-report-render" className="bg-[#FFFDF9] border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6 text-brand-800">
              
              {/* Header */}
              <div className="border-b border-brand-200 pb-4">
                <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Investigation Case file</span>
                <h3 className="text-2xl font-black text-brand-800 mt-1">{caseDetail.title}</h3>
                <p className="text-xs text-brand-500 mt-1.5">{caseDetail.description || 'No description provided.'}</p>
                <div className="flex justify-between items-center text-[10px] text-brand-400 mt-4">
                  <span>Created: {new Date(caseDetail.createdAt).toLocaleString()}</span>
                  <span className="uppercase font-bold text-accent-blue">Status: {caseDetail.status}</span>
                </div>
              </div>

              {/* Combined Analytics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200">
                  <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest">Aggregate Trust</span>
                  <p className={`text-3xl font-black mt-1 ${
                    avgScore >= 75 ? 'text-accent-green' : (avgScore >= 45 ? 'text-accent-amber' : 'text-accent-red')
                  }`}>{avgScore}%</p>
                </div>
                <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200">
                  <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest">Total Evidence</span>
                  <p className="text-3xl font-black text-brand-800 mt-1">{totalLinked} Files</p>
                </div>
              </div>

              {/* Forensic Timeline */}
              <div className="space-y-4">
                <h4 className="font-bold text-brand-800 text-sm uppercase tracking-wider border-b border-brand-100 pb-2">
                  Evidence Timeline
                </h4>
                
                {linkedReports.length === 0 ? (
                  <p className="text-xs text-brand-500 py-6 text-center italic">No evidence files linked to this case file yet.</p>
                ) : (
                  <div className="relative border-l border-brand-200 ml-3 space-y-6 pt-2">
                    {linkedReports.map((report) => (
                      <div key={report._id} className="relative pl-6">
                        {/* Timeline bubble */}
                        <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-blue border border-white"></span>
                        
                        <div className="bg-white p-4 rounded-2xl border border-brand-200 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-brand-800 hover:text-accent-blue cursor-pointer" onClick={() => setActiveTab(`report_detail:${report._id}`)}>
                              {report.fileName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              report.verdict === 'safe'
                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                                : (report.verdict === 'suspicious' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20')
                            }`}>{report.verdict}</span>
                          </div>
                          
                          <p className="text-[10px] text-brand-600 italic">"{report.aiExplanation}"</p>
                          <div className="flex justify-between items-center text-[9px] text-brand-400 pt-2 border-t border-brand-100">
                            <span className="capitalize">{report.mediaType} analysis</span>
                            <span className="font-black text-brand-800">Score: {report.authenticityScore}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Combined Anomalies */}
              {allAnomalies.length > 0 && (
                <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200 space-y-2">
                  <h4 className="font-bold text-accent-red text-xs uppercase tracking-wider">Aggregated Anomalies Warning</h4>
                  <ul className="space-y-1.5 text-[10px] text-brand-650">
                    {allAnomalies.map((anom, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span>⚠️</span>
                        <span>{anom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* Right link report sidebar */}
          <div className="bg-white border border-brand-200 rounded-3xl p-5 shadow-sm space-y-6">
            <h4 className="font-bold text-brand-800 text-sm border-b border-brand-200 pb-2">Link Evidence</h4>
            
            <form onSubmit={handleLinkReport} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-brand-500 tracking-wider mb-2">
                  Select Forensic Log
                </label>
                <select
                  required
                  className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue rounded-xl px-3 py-2.5 text-xs focus:outline-none transition text-brand-800"
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                >
                  <option value="">-- Choose Audit --</option>
                  {allReports
                    .filter(r => !linkedReports.some(lr => lr._id === r._id))
                    .map(r => (
                      <option key={r._id} value={r._id}>
                        [{r.mediaType.toUpperCase()}] {r.fileName}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLinking || !selectedReportId}
                className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm min-h-[44px]"
              >
                {isLinking ? 'Linking...' : 'Add Evidence To Case'}
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // RENDER CASES LIST MODE
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-800 flex items-center space-x-2">
          <span>📂</span> <span>Investigation Case Workspace</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Group multiple voice, image, and document verifications into structured, exportable case files.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Case Creation card */}
        <div className="bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-black text-brand-800 border-b border-brand-200 pb-2">Create New Case</h3>
          
          <form onSubmit={handleCreateCase} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Case Title</label>
              <input
                type="text"
                required
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-brand-400 transition text-brand-850"
                placeholder="e.g. Contract Verification #401"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase text-brand-500 tracking-wider mb-2">Case Description</label>
              <textarea
                className="w-full bg-brand-50 border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-brand-400 transition text-brand-850 h-24 resize-none"
                placeholder="Details or investigation notes..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md min-h-[44px]"
            >
              {isCreating ? 'Creating...' : 'Initialize Case'}
            </button>
          </form>
        </div>

        {/* Case List container */}
        <div className="md:col-span-2 bg-white border border-brand-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-black text-brand-800 border-b border-brand-200 pb-2 flex justify-between items-center">
            Active Investigations
            <span className="bg-brand-100 text-brand-700 text-xs px-2.5 py-1 rounded-full font-bold">
              {cases.length} Cases
            </span>
          </h3>

          {loadingList ? (
            <p className="text-center py-10 text-brand-450">Loading cases directory...</p>
          ) : cases.length === 0 ? (
            <div className="text-center py-12 text-brand-500">
              <span className="text-4xl block mb-2">📂</span>
              <p className="text-xs font-semibold">No active cases.</p>
              <p className="text-[10px] mt-1">Create an investigation file on the left to start linking evidence.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cases.map((c) => (
                <div 
                  key={c._id}
                  onClick={() => setActiveTab(`case_detail:${c._id}`)}
                  className="bg-brand-50 border border-brand-200 hover:border-brand-350 p-5 rounded-2xl cursor-pointer hover:scale-[1.01] transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] font-bold text-brand-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                        c.status === 'active' 
                          ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' 
                          : 'bg-brand-200 text-brand-600 border-brand-300'
                      }`}>{c.status}</span>
                    </div>
                    <h4 className="font-bold text-sm text-brand-800 group-hover:text-accent-blue transition truncate">
                      {c.title}
                    </h4>
                    <p className="text-[10px] text-brand-550 leading-relaxed line-clamp-2">
                      {c.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-brand-450 pt-2 border-t border-brand-200/50">
                    <span>📂 {c.reports?.length || 0} Evidence files</span>
                    <button 
                      onClick={(e) => handleDeleteCase(c._id, e)}
                      className="text-brand-400 hover:text-accent-red font-bold text-[9px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
