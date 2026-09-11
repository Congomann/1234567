import React, { useEffect } from 'react';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  Globe, 
  TrendingUp, 
  ShieldCheck,
  Megaphone,
  Briefcase,
  Loader2,
  FileDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { PDFBrandingService } from '../../services/pdfBrandingService';

/**
 * NHFG PRESS RELEASES & NEWS HUB
 * High-performance newsroom for official announcements.
 */

interface PressRelease {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  image?: string;
}

const PRESS_RELEASES: PressRelease[] = [
  {
    id: '1',
    date: 'May 12, 2026',
    category: 'Corporate',
    title: 'New Holland Financial Group Surpasses $2B in Assets Under Management',
    excerpt: 'NHFG reaches a major milestone in growth, driven by expansion into the West Coast real estate market and logistics financing...',
  },
  {
    id: '2',
    date: 'April 28, 2026',
    category: 'Innovation',
    title: 'NHFG Launches AI-Powered Market Intelligence Terminal for Real Estate Realtors',
    excerpt: 'The new proprietary platform provides predictive yield modeling and real-time neighborhood risk assessment for institutional investors...',
  },
  {
    id: '3',
    date: 'April 15, 2026',
    category: 'Logistics',
    title: 'Logistics Division Expands Freight Brokerage Network to Over 5,000 Carriers',
    excerpt: 'New Holland Logistics announces nationwide carrier network expansion, improving dispatch times and lowering shipping costs for SMBs...',
  },
  {
    id: '4',
    date: 'March 22, 2026',
    category: 'Transparency',
    title: 'NHFG Named "Most Transparent Financial Group" by Independent Auditor Council',
    excerpt: 'Recognized for the "Transparency Ledger" initiative, New Holland continues to lead the industry in open-book regulatory reporting...',
  },
  {
    id: '5',
    date: 'March 05, 2026',
    category: 'Partnership',
    title: 'New Holland Announces Strategic Partnership with Global Reinsurance Leader',
    excerpt: 'Collaborative venture aimed at providing specialized group benefits for logistics and transportation companies nationwide...',
  }
];

export const PressReleases: React.FC = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadMediaKit = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    PDFBrandingService.addHeader(doc, "CORPORATE MEDIA KIT 2025");
    
    doc.setFontSize(16);
    doc.setTextColor(11, 34, 64);
    doc.text("Brand Identity & Communication Guidelines", 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("New Holland Financial Group is a multi-vertical financial and logistics powerhouse.", 14, 70);
    doc.text("Mission: Absolute Transparency. Innovation. Scale.", 14, 75);

    doc.text("Media Contacts:", 14, 90);
    doc.text("- global.press@newholland.com", 14, 98);
    doc.text("- PR Hotline: 800-555-NEWS", 14, 104);

    PDFBrandingService.addFooter(doc);
    window.open(doc.output('bloburl'), '_blank');
    
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const handleReadFullRelease = (release: any) => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    PDFBrandingService.addHeader(doc, "OFFICIAL PRESS RELEASE");
    
    doc.setFontSize(18);
    doc.setTextColor(11, 34, 64);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(release.title.toUpperCase(), 180);
    doc.text(titleLines, 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`FOR IMMEDIATE RELEASE - ${release.date}`, 14, 80);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    const bodyText = `${release.excerpt}\n\nNEW HOLLAND, IA — New Holland Financial Group today announced further details regarding this milestone. The initiative reflects our ongoing commitment to market leadership and client-centric innovation.\n\n"We are building for the future," said a company spokesperson. "This announcement is just the beginning of our next phase of scale."\n\n### ABOUT NEW HOLLAND FINANCIAL GROUP\nNew Holland Financial Group is a premier multi-vertical financial services and logistics firm dedicated to absolute transparency and high-performance asset management.`;
    const bodyLines = doc.splitTextToSize(bodyText, 180);
    doc.text(bodyLines, 14, 95);

    PDFBrandingService.addFooter(doc);
    window.open(doc.output('bloburl'), '_blank');
    
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">
              <Megaphone size={14} /> Official Newsroom
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              Press <span className="text-blue-600">Releases.</span>
            </h1>
          </div>
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search press library..." 
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Featured Story */}
        <div className="mb-24 relative group cursor-pointer overflow-hidden rounded-[4rem] bg-[#0B2240] text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-[800px] h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch min-h-[500px]">
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1.5 bg-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">Featured Release</span>
                <span className="text-blue-200/60 font-bold text-sm tracking-tight">May 15, 2026</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-tight group-hover:text-blue-400 transition-colors">
                NHFG Announces $250M Expansion into Sustainable Infrastructure Financing.
              </h2>
              <p className="text-xl text-blue-100/70 font-medium leading-relaxed mb-12">
                The strategic shift marks a pivotal moment in the group's investment history, focusing on renewable energy logistics and green property development.
              </p>
              <button 
                onClick={() => handleReadFullRelease({ id: 'featured', title: 'Expansion into Sustainable Infrastructure', date: 'May 15, 2026', excerpt: 'The strategic shift marks a pivotal moment in the group\'s investment history...' })}
                className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] group-hover:gap-6 transition-all"
              >
                Read Full Release <ArrowRight size={16} className="text-blue-400" />
              </button>
            </div>
            <div className="lg:w-1/2 relative bg-slate-800 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-[#0B2240] to-slate-950 flex items-center justify-center p-8">
                 <div className="text-center text-white/80">
                   <h4 className="text-lg font-bold text-white mb-2">New Holland Financial Press Desk</h4>
                   <p className="text-xs text-slate-300">Official Corporate Announcements & Regulatory Updates</p>
                 </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-[#0B2240] via-[#0B2240]/40 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRESS_RELEASES.map((release, idx) => (
            <div 
              key={idx}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col group hover:shadow-2xl hover:shadow-slate-300/40 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-lg">{release.category}</span>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                  <Calendar size={14} /> {release.date}
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-6 group-hover:text-blue-600 transition-colors">
                {release.title}
              </h3>
              
              <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-1">
                {release.excerpt}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <button 
                  onClick={() => handleReadFullRelease(release)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors"
                >
                  Full Report Available
                </button>
                <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Media Contact Footer */}
        <div className="mt-24 p-12 md:p-20 bg-slate-50 rounded-[4rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-none">Media Inquiries</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-0">
              For official statements, interview requests, or media kits, please contact our global communications department.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a 
              href="mailto:press@newholland.com?subject=Media Inquiry: NHFG Newsroom"
              className="bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-50 text-center transition-all shadow-sm"
            >
              Email Newsroom
            </a>
            <button 
              onClick={handleDownloadMediaKit}
              disabled={isGenerating}
              className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:scale-105 transition-all text-center shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {isGenerating ? 'Generating...' : 'Download Media Kit'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
