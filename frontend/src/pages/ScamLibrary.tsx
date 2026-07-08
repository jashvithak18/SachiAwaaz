import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export interface ScamCase {
  id: string;
  title: string;
  category: 'Image' | 'Voice' | 'Document' | 'Website' | 'Email' | 'QR';
  summary: string;
  risk: 'safe' | 'suspicious' | 'manipulated';
  score: number;
}

export default function ScamLibrary() {
  const { setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const cases: ScamCase[] = [
    { id: 'mock_case_1', title: 'Fake HR Offer Letter - HDFC Bank', category: 'Document', summary: 'A PDF offer letter sent from an external Gmail address requesting security deposits.', risk: 'manipulated', score: 18 },
    { id: 'mock_case_2', title: 'Deepfake CEO Voice Message', category: 'Voice', summary: 'Voicemail claiming to be company executive demanding quick crypto transfers.', risk: 'manipulated', score: 12 },
    { id: 'mock_case_3', title: 'AI-Generated Aadhaar Card Scan', category: 'Image', summary: 'Identity verification card with synthetic textures and misaligned fonts.', risk: 'manipulated', score: 25 },
    { id: 'mock_case_4', title: 'Edited Payment Screenshot (Google Pay)', category: 'Image', summary: 'UPI receipt showing 25,000 INR transfer with modified font boundaries.', risk: 'manipulated', score: 32 },
    { id: 'mock_case_5', title: 'Fake PAN Card Identity Scan', category: 'Image', summary: 'PAN card photo modified to bypass digital rental agreements.', risk: 'manipulated', score: 28 },
    { id: 'mock_case_6', title: 'AI-Generated Passport Photograph', category: 'Image', summary: 'Passport face model lacking camera lens artifacts and sensor noise.', risk: 'manipulated', score: 15 },
    { id: 'mock_case_7', title: 'Deepfake Political Election Speech', category: 'Voice', summary: 'Audio segment showing generative voice matching a national candidate.', risk: 'manipulated', score: 9 },
    { id: 'mock_case_8', title: 'Fake Vendor Invoice - HCL Solutions', category: 'Document', summary: 'Billing PDF where bank account routing details were edited.', risk: 'manipulated', score: 40 },
    { id: 'mock_case_9', title: 'Fake Bank Statement - SBI Savings', category: 'Document', summary: 'Excel export PDF with altered transaction rows.', risk: 'manipulated', score: 35 },
    { id: 'mock_case_10', title: 'AI-Generated Selfie KYC Verification', category: 'Image', summary: 'Selfie upload holding card containing pure digital mathematical noise.', risk: 'manipulated', score: 22 },
    { id: 'mock_case_11', title: 'Fake Flight Ticket PDF - IndiGo', category: 'Document', summary: 'Flight reservation confirmation showing manual date modifications.', risk: 'suspicious', score: 58 },
    { id: 'mock_case_12', title: 'Spoofed India Post Courier Address Link', category: 'Link' as any, summary: 'SMS notification link containing lookalike postal updates.', risk: 'manipulated', score: 15 },
    { id: 'mock_case_13', title: 'Fake Income Tax Notice (ITR)', category: 'Document', summary: 'Demand note requesting immediate penalty pay outs.', risk: 'manipulated', score: 20 },
    { id: 'mock_case_14', title: 'Lookalike Banking Portal - ICICI Security', category: 'Website', summary: 'Web domain using non-latin homograph characters.', risk: 'manipulated', score: 8 },
    { id: 'mock_case_15', title: 'Fake GPay Cashback Reward QR Sticker', category: 'QR', summary: 'Reward banner instructing scanner to verify outgoing transactions.', risk: 'manipulated', score: 14 },
    { id: 'mock_case_16', title: 'Fake Job Selection Mail - Tech Mahindra', category: 'Email', summary: 'Email header showing display name spoof and mismatched IP routes.', risk: 'manipulated', score: 24 },
    { id: 'mock_case_17', title: 'AI Cloned Voicemail - Child Emergency', category: 'Voice', summary: 'Distressed caller spoofing vocal tracts of a target relative.', risk: 'manipulated', score: 11 },
    { id: 'mock_case_18', title: 'Fake Salary Slip - Infosys Ltd', category: 'Document', summary: 'Salary details showing misaligned font boundaries.', risk: 'suspicious', score: 48 },
    { id: 'mock_case_19', title: 'Fake Rent Receipt - Housing Claim', category: 'Document', summary: 'Receipt containing duplicate signatures and clean PDF metadata.', risk: 'suspicious', score: 62 },
    { id: 'mock_case_20', title: 'Fake Electricity Bill - Disconnection warning', category: 'Document', summary: 'PDF alert detailing immediate blackouts due to unpaid bills.', risk: 'manipulated', score: 30 },
    { id: 'mock_case_21', title: 'AI Celebrity Investment Video Endorsement', category: 'Image', summary: 'Video frame analysis displaying facial warping artifacts.', risk: 'manipulated', score: 19 },
    { id: 'mock_case_22', title: 'Spoofed customer care verification portal', category: 'Website', summary: 'Lookalike support page requesting UPI credentials.', risk: 'manipulated', score: 12 },
    { id: 'mock_case_23', title: 'Fake electricity bill SMS Link', category: 'Link' as any, summary: 'Insecure address hosting script tracking page details.', risk: 'suspicious', score: 52 },
    { id: 'mock_case_24', title: 'Fake rewards coupon link', category: 'Link' as any, summary: 'Redirection chain masking malicious download payloads.', risk: 'manipulated', score: 34 },
    { id: 'mock_case_25', title: 'Deepfake customer service audio verification', category: 'Voice', summary: 'Support call containing mechanical phase alignment issues.', risk: 'suspicious', score: 60 },
    { id: 'mock_case_26', title: 'AI-Generated corporate profile avatar', category: 'Image', summary: 'LinkedIn face portrait showing mismatched ear sizes and synthetic noise.', risk: 'manipulated', score: 26 },
    { id: 'mock_case_27', title: 'Edited merit certificate PDF', category: 'Document', summary: 'Achievement file showing altered name text boxes.', risk: 'suspicious', score: 65 },
    { id: 'mock_case_28', title: 'Fake donation receipt verification', category: 'Document', summary: 'Receipt PDF generated in online canvas templates.', risk: 'suspicious', score: 70 },
    { id: 'mock_case_29', title: 'Spoofed delivery tracking email headers', category: 'Email', summary: 'EML header showing failed SPF alignment from an anonymous relay.', risk: 'manipulated', score: 18 },
    { id: 'mock_case_30', title: 'Fake crypto trading deposit page', category: 'Website', summary: 'Newly registered exchange domain containing zero registration history.', risk: 'manipulated', score: 10 }
  ];

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-brand-850 flex items-center space-x-3">
          <span>📚</span> <span>Educational Scam Library</span>
        </h2>
        <p className="text-brand-500 text-sm mt-1">
          Explore our interactive repository of 30 realistic demo cases. Click any case file to review its detailed forensic audit.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          className="flex-grow bg-white border border-brand-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-brand-400 text-brand-850 shadow-sm w-full"
          placeholder="Search scam files (e.g. HDFC, CEO, Aadhaar)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="bg-white border border-brand-200 rounded-xl px-4 py-3 text-xs text-brand-700 outline-none shadow-sm focus:border-accent-blue w-full sm:w-48"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Media</option>
          <option value="image">Image Forensics</option>
          <option value="voice">Voice Authentication</option>
          <option value="document">Document Integrity</option>
          <option value="website">Website Checks</option>
          <option value="email">Email Analysis</option>
          <option value="qr">QR Code Scanner</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCases.map(c => (
          <div
            key={c.id}
            onClick={() => setActiveTab(`report_detail:${c.id}`)}
            className="bg-white border border-brand-200 hover:border-accent-blue rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {c.category}
                </span>
                <span className={`text-[10px] font-bold uppercase ${c.risk === 'safe' ? 'text-accent-green' : c.risk === 'suspicious' ? 'text-accent-amber' : 'text-accent-red'}`}>
                  {c.risk === 'safe' ? 'Safe' : c.risk === 'suspicious' ? 'Review' : 'Danger'}
                </span>
              </div>
              <h3 className="font-bold text-brand-850 text-sm leading-snug line-clamp-2">{c.title}</h3>
              <p className="text-[11px] text-brand-550 leading-relaxed line-clamp-3">{c.summary}</p>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-brand-100 text-[10px]">
              <span className="text-brand-500 font-bold">Trust: {c.score}%</span>
              <span className="text-accent-blue font-bold hover:underline">View Forensic Audit →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
