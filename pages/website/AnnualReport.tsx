import React, { useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Gavel, 
  ShieldAlert,
  ArrowDownToLine,
  ExternalLink,
  ChevronRight,
  Loader2,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { jsPDF } from 'jspdf';
import { PDFBrandingService } from '../../services/pdfBrandingService';

/**
 * NHFG ANNUAL REPORT & TRANSPARENCY HUB
 * Designed for absolute corporate transparency.
 */

const SALES_DATA = [
  { year: '2022', revenue: 4.2 },
  { year: '2023', revenue: 7.8 },
  { year: '2024', revenue: 12.4 },
  { year: '2025 (Proj)', revenue: 18.2 },
];

const REVENUE_BREAKDOWN = [
  { name: 'Insurance', value: 45, color: '#3B82F6' },
  { name: 'Securities', value: 25, color: '#10B981' },
  { name: 'Logistics', value: 20, color: '#F59E0B' },
  { name: 'Real Estate', value: 10, color: '#8B5CF6' },
];

export const AnnualReport: React.FC = () => {
  const { companySettings } = useData();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const metrics = companySettings.annualReportData?.metrics || {
    totalSales: 18.2,
    salesGrowth: 46.5,
    complianceRating: 99.8,
    activeLawsuits: 0,
    totalFines: 0,
    activeStates: 48
  };

  const audits = companySettings.annualReportData?.audits || [];
  const partnerRevenue = companySettings.annualReportData?.partnerRevenue || [];
  const quarterlyReports = companySettings.annualReportData?.quarterlyReports || [];
  const isPublished = companySettings.annualReportData?.isPublished ?? false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadReport = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    PDFBrandingService.addHeader(doc, "ANNUAL CORPORATE REPORT 2025");
    
    doc.setFontSize(16);
    doc.setTextColor(11, 34, 64);
    doc.text("Executive Financial Summary", 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("New Holland Financial Group continues to demonstrate robust operational efficiency", 14, 70);
    doc.text(`and absolute market transparency. Gross Sales YTD: $${metrics.totalSales}M (+${metrics.salesGrowth}% YoY).`, 14, 75);

    // Transparency Ledger
    doc.setFontSize(14);
    doc.setTextColor(11, 34, 64);
    doc.text("Transparency Ledger", 14, 90);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`- Regulatory Fines: $${metrics.totalFines.toLocaleString()}`, 14, 100);
    doc.text(`- Active Lawsuits: ${metrics.activeLawsuits}`, 14, 105);
    doc.text(`- Compliance Rating: ${metrics.complianceRating}%`, 14, 110);

    // Partner Breakdown
    doc.setFontSize(14);
    doc.setTextColor(11, 34, 64);
    doc.text("Strategic Partner Performance", 14, 125);
    
    let y = 135;
    partnerRevenue.filter((p: any) => p.visible !== false).forEach((p: any) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const volume = p.revenue >= 1000000 ? `$${(p.revenue / 1000000).toFixed(1)}M` : `$${(p.revenue / 1000).toFixed(0)}K`;
        doc.text(`${p.name} (${p.vertical}): ${volume} Contribution`, 14, y);
        y += 8;
    });

    PDFBrandingService.addFooter(doc);
    window.open(doc.output('bloburl'), '_blank');
    
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-blue-200">
            <ShieldCheck size={14} /> Corporate Transparency Initiative
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
            Annual Report <span className="text-blue-600">2025.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Transparency is the foundation of New Holland Financial Group. We believe in absolute accountability to our clients, advisors, and the states we serve.
          </p>
        </div>

        {!isPublished ? (
          <div className="bg-white p-16 md:p-24 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-10 border border-blue-100">
               <ShieldCheck size={40} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Pending Release</h2>
            <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-2xl">
               The comprehensive corporate transparency report, partner network performance metrics, and financial disclosures for the current fiscal year will be publicly released at the end of the year.
            </p>
            <div className="px-6 py-3 bg-slate-50 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest border border-slate-200">
               Check back on December 31st
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Gross Sales (YTD)</h3>
            <p className="text-4xl font-black text-slate-900">${metrics.totalSales}M</p>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
              <ChevronRight size={14} className="-rotate-90" /> +{metrics.salesGrowth}% vs 2024
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Compliance Rating</h3>
            <p className="text-4xl font-black text-slate-900">{metrics.complianceRating}%</p>
            <div className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">External Audit Score</div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8">
              <Scale size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">State Licenses</h3>
            <p className="text-4xl font-black text-slate-900">{metrics.activeStates}/50</p>
            <div className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Active State Authority</div>
          </div>
        </div>

        {/* Partner Network Performance Section - MOVED ABOVE QUARTERLY */}
        <div className="bg-white p-12 md:p-20 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 mb-24 overflow-hidden relative">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Partner Network Performance</h2>
            <p className="text-lg text-slate-500 font-medium">
              We break down our success by the partners who help drive it. Below is the total business volume facilitated through our primary strategic alliances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerRevenue.filter((p: any) => p.visible !== false).map((partner: any, idx: number) => {
              const displayRevenue = partner.revenue >= 1000000 ? `$${(partner.revenue / 1000000).toFixed(1)}M` : `$${(partner.revenue / 1000).toFixed(0)}K`;
              return (
                <div key={idx} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-blue-50 transition-all group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{partner.vertical}</h3>
                  <h4 className="font-black text-slate-900 mb-2 tracking-tight leading-none">{partner.name}</h4>
                  <p className="text-3xl font-black text-blue-600 group-hover:scale-110 transition-transform origin-left">{displayRevenue}</p>
                  <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Strategic Contribution
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quarterly Disclosures Section (Every 3 months) */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <Layers className="text-blue-600" size={28} /> Quarterly Disclosures
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quarterlyReports.map((report: any) => (
              <div key={report.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 group hover:bg-slate-900 transition-all cursor-pointer">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:bg-white/10 group-hover:text-white transition-all">
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-white transition-colors">{report.title}</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 group-hover:text-white/40 transition-colors">Released: {report.date}</p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:text-blue-400 transition-colors">
                  View Full Statement <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
            <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-4">
              Revenue Growth <span className="text-blue-600 text-sm font-bold uppercase tracking-widest">(In Millions USD)</span>
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1rem'}}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[10, 10, 10, 10]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
            <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Revenue Breakdown</h2>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="h-[240px] w-[240px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={REVENUE_BREAKDOWN}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {REVENUE_BREAKDOWN.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-6">
                {REVENUE_BREAKDOWN.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Ledger: Violations, Fines, Lawsuits */}
        <div className="bg-[#0B2240] rounded-[4rem] p-12 md:p-20 text-white shadow-3xl shadow-blue-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500 rounded-full mix-blend-overlay filter blur-[150px] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="max-w-2xl mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
                The Transparency <span className="text-blue-400 font-serif italic">Ledger.</span>
              </h2>
              <p className="text-xl text-blue-100/70 font-medium leading-relaxed">
                We maintain an open-book policy regarding our regulatory standing. Below is a full disclosure of all corporate legal and compliance events.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Column 1: Fines & Violations */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-300 border border-white/10">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Regulatory Fines</h3>
                </div>
                
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center min-h-[200px]">
                  <p className="text-4xl font-black text-blue-400 mb-2">$0.00</p>
                  <p className="text-xs font-black text-blue-200/40 uppercase tracking-widest">Total Fines in 2025</p>
                </div>
                <p className="text-sm text-blue-200/60 font-medium leading-relaxed px-4">
                  New Holland Financial Group has maintained a perfect regulatory record for the current fiscal year across all 48 active states.
                </p>
              </div>

              {/* Column 2: Legal Proceedings */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-300 border border-white/10">
                    <Gavel size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Active Lawsuits</h3>
                </div>
                
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center min-h-[200px]">
                  <p className="text-4xl font-black text-blue-400 mb-2">0</p>
                  <p className="text-xs font-black text-blue-200/40 uppercase tracking-widest">Open Legal Actions</p>
                </div>
                <p className="text-sm text-blue-200/60 font-medium leading-relaxed px-4">
                  There are currently no active lawsuits, class actions, or pending litigation against the group or its subsidiaries.
                </p>
              </div>

              {/* Column 3: State Audits */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-300 border border-white/10">
                    <ShieldAlert size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">State Audits</h3>
                </div>
                
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center min-h-[200px]">
                  <p className="text-4xl font-black text-blue-400 mb-2">4</p>
                  <p className="text-xs font-black text-blue-200/40 uppercase tracking-widest">Successful Audits (2025)</p>
                </div>
                <p className="text-sm text-blue-200/60 font-medium leading-relaxed px-4">
                  The states of NY, FL, TX, and CA have completed comprehensive operational audits this year with zero findings.
                </p>
              </div>
            </div>
          </div>
        </div>





        {/* Download Full Report */}
        <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-12 bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="max-w-xl">
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Detailed Financial Statement</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              For institutional partners, investors, and regulatory bodies, we provide a full 200+ page disclosure document covering every aspect of our operations.
            </p>
          </div>
          <button 
            onClick={handleDownloadReport}
            disabled={isGenerating}
            className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 whitespace-nowrap disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ArrowDownToLine size={18} />} 
            {isGenerating ? 'Generating...' : 'Download Full Report (PDF)'}
          </button>
        </div>
        </>
        )}

      </div>
    </div>
  );
};
