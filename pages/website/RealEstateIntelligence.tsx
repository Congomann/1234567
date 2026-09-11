import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Calculator,
  Shield,
  Home,
  Building2,
  DollarSign,
  Briefcase,
  Zap,
  Target,
  ArrowUpRight,
  Info,
  Layers,
  Activity,
} from "lucide-react";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType, UserRole, AdvisorCategory } from "../../types";
import { PDFBrandingService } from "../../services/pdfBrandingService";
import { jsPDF } from "jspdf";
import { useData } from "../../context/DataContext";
import { FileDown, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const MARKET_DATA = [
  { month: "Jan", price: 420, inventory: 450, absorption: 12 },
  { month: "Feb", price: 425, inventory: 430, absorption: 15 },
  { month: "Mar", price: 438, inventory: 410, absorption: 18 },
  { month: "Apr", price: 445, inventory: 390, absorption: 22 },
  { month: "May", price: 460, inventory: 380, absorption: 25 },
  { month: "Jun", price: 475, inventory: 400, absorption: 21 },
  { month: "Jul", price: 480, inventory: 420, absorption: 19 },
  { month: "Aug", price: 472, inventory: 440, absorption: 16 },
  { month: "Sep", price: 485, inventory: 430, absorption: 20 },
  { month: "Oct", price: 495, inventory: 410, absorption: 24 },
  { month: "Nov", price: 510, inventory: 390, absorption: 28 },
  { month: "Dec", price: 525, inventory: 370, absorption: 32 },
];

const NEIGHBORHOOD_STATS = [
  { subject: 'Schools', A: 120, B: 110, fullMark: 150 },
  { subject: 'Transit', A: 98, B: 130, fullMark: 150 },
  { subject: 'Safety', A: 86, B: 130, fullMark: 150 },
  { subject: 'Dining', A: 99, B: 100, fullMark: 150 },
  { subject: 'Groceries', A: 85, B: 90, fullMark: 150 },
  { subject: 'Parks', A: 65, B: 85, fullMark: 150 },
];

export const RealEstateIntelligence: React.FC = () => {
  const { user } = useData();
  const [purchasePrice, setPurchasePrice] = useState(750000);
  const [monthlyRent, setMonthlyRent] = useState(45000);
  const [expenses, setExpenses] = useState(12000);
  const [isGenerating, setIsGenerating] = useState(false);

  // AUTH GUARD: Only Real Estate Realtors (Advisors) or Admin can access
  const isAuthorized = user?.role === UserRole.ADMIN || 
                      (user?.role === UserRole.ADVISOR && user?.category === AdvisorCategory.REAL_ESTATE);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 bg-white">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 font-medium">
            The Market Intelligence Terminal is reserved for authorized NHFG Real Estate Realtors only.
          </p>
          <div className="pt-4">
             <Link to="/products" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-black transition-all">
                Back to Solutions
             </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadReport = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    PDFBrandingService.addHeader(doc, "MARKET INTELLIGENCE REPORT");
    
    doc.setFontSize(16);
    doc.setTextColor(11, 34, 64);
    doc.text("Real Estate Analytics & Yield Modeling", 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Purchase Price: $${purchasePrice.toLocaleString()}`, 14, 70);
    doc.text(`Monthly Rent: $${monthlyRent.toLocaleString()}`, 14, 75);
    doc.text(`Annual Expenses: $${(expenses * 12).toLocaleString()}`, 14, 80);

    doc.setFontSize(12);
    doc.setTextColor(11, 34, 64);
    doc.text("Performance Metrics", 14, 95);
    doc.text(`NOI: $${roiMetrics.noi.toLocaleString()}`, 14, 105);
    doc.text(`Cap Rate: ${roiMetrics.capRate}%`, 14, 110);
    doc.text(`Cash-on-Cash: ${roiMetrics.cashOnCash}%`, 14, 115);

    PDFBrandingService.addFooter(doc);
    doc.save(`NHFG_Market_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const roiMetrics = useMemo(() => {
    const annualRent = monthlyRent * 12;
    const annualExpenses = expenses * 12;
    const noi = annualRent - annualExpenses;
    const capRate = (noi / purchasePrice) * 100;
    const cashOnCash = (noi / (purchasePrice * 0.25)) * 100; // Assuming 25% down
    
    return {
      noi,
      capRate: capRate.toFixed(2),
      cashOnCash: cashOnCash.toFixed(2),
    };
  }, [purchasePrice, monthlyRent, expenses]);

  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 border-b border-slate-100 pb-12">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-amber-100">
              <Activity className="w-4 h-4" />
              Market Intelligence Terminal
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
              Real Estate <span className="text-amber-500">Analytics</span>
            </h1>
          </div>
          
          <button 
            onClick={handleDownloadReport}
            disabled={isGenerating}
            className="flex items-center gap-3 px-8 py-4 bg-[#0B2240] text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Download Market Report
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Market Temp', value: 'Hot', sub: 'Seller Advantage', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Avg. appreciation', value: '12.4%', sub: 'Last 12 Months', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Days on Market', value: '18', sub: 'Area Average', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Investor Yield', value: '6.2%', sub: 'Mean Cap Rate', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${stat.color}`}>
                        <stat.icon size={80} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <h3 className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.sub}</p>
                </div>
            ))}
        </div>

        {/* Yield Modeling Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Inputs */}
          <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-900/5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              Yield Modeling Engine
            </h3>
            
            <div className="space-y-8">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Purchase Price</label>
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">$</span>
                        <input 
                            type="number" 
                            value={purchasePrice}
                            onChange={e => setPurchasePrice(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl py-5 pl-12 pr-6 text-xl font-black text-slate-900 focus:bg-white focus:border-amber-500/30 outline-none transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Monthly Rent Target</label>
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">$</span>
                        <input 
                            type="number" 
                            value={monthlyRent}
                            onChange={e => setMonthlyRent(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl py-5 pl-12 pr-6 text-xl font-black text-slate-900 focus:bg-white focus:border-amber-500/30 outline-none transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Monthly OpEx (Tax/Ins/Mgmt)</label>
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">$</span>
                        <input 
                            type="number" 
                            value={expenses}
                            onChange={e => setExpenses(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-transparent rounded-2xl py-5 pl-12 pr-6 text-xl font-black text-slate-900 focus:bg-white focus:border-amber-500/30 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    This model assumes a 25% down payment and standard 30-year fixed financing at current rates.
                </p>
            </div>
          </div>

          {/* Metrics Visualization */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0B2240] p-12 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-12 opacity-10"><TrendingUp size={200} strokeWidth={1} /></div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight mb-8">Performance Summary</h3>
                    <div className="space-y-10">
                        <div>
                            <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Net Operating Income (NOI)</div>
                            <div className="text-5xl font-black text-amber-500">${roiMetrics.noi.toLocaleString()}</div>
                            <div className="text-[10px] text-blue-200/40 uppercase tracking-widest mt-1 font-bold">Projected Annual Profit</div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cap Rate</div>
                                <div className="text-4xl font-black">{roiMetrics.capRate}%</div>
                            </div>
                            <div>
                                <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cash on Cash</div>
                                <div className="text-4xl font-black">{roiMetrics.cashOnCash}%</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <ArrowUpRight className="text-amber-500" />
                    </div>
                    <p className="text-xs text-blue-100/60 font-medium leading-relaxed italic">
                        "Your estimated ROI exceeds the market average for this asset class."
                    </p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8">Neighborhood DNA</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={NEIGHBORHOOD_STATS}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar name="Subject Area" dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
                            <Radar name="City Average" dataKey="B" stroke="#0B2240" fill="#0B2240" fillOpacity={0.1} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-8 space-y-3">
                    <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                        <span className="font-black text-slate-400 uppercase">Transit Score</span>
                        <span className="font-black text-slate-900">88/100 (Excellent)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                        <span className="font-black text-slate-400 uppercase">School District</span>
                        <span className="font-black text-slate-900">Distinguished</span>
                    </div>
                </div>
              </div>
          </div>
        </div>

        {/* Market Pulse Chart */}
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/5 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Market Pulse Index</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3 h-3 text-amber-500" />
                        Historical Price vs Inventory Absorption (2024)
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Price/SqFt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Inventory</span>
                    </div>
                </div>
            </div>

            <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MARKET_DATA}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fontWeight: 800, fill: '#94a3b8'}}
                            dy={15}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fontWeight: 800, fill: '#94a3b8'}}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip 
                            contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '24px'}}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#F59E0B" 
                            strokeWidth={5} 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            animationDuration={2000}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="inventory" 
                            stroke="#cbd5e1" 
                            strokeWidth={2} 
                            strokeDasharray="10 10" 
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* CTA Section */}
        <div className="bg-amber-500 rounded-[4rem] p-16 lg:p-24 text-center relative overflow-hidden group mb-20 shadow-3xl shadow-amber-500/20">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
                <h3 className="text-4xl lg:text-6xl font-black text-[#0B2240] tracking-tighter uppercase leading-tight mb-8">
                    Unlock Private <br /><span className="text-white">Market Access.</span>
                </h3>
                <p className="text-[#0B2240]/60 text-lg font-medium max-w-2xl mx-auto mb-12">
                    Our intelligence terminal is just the beginning. Connect with a senior advisor for off-market listings and institutional-grade portfolio analysis.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <button 
                        onClick={() => document.getElementById('speak-to-advisor')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-12 py-6 bg-[#0B2240] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                    >
                        Establish Connection
                    </button>
                    <button 
                        onClick={handleDownloadReport}
                        disabled={isGenerating}
                        className="px-12 py-6 bg-white/20 text-[#0B2240] backdrop-blur-md rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all border border-[#0B2240]/10 flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Download Market Report
                    </button>
                </div>
            </div>
        </div>

        <SpeakToAdvisorForm productType={ProductType.REAL_ESTATE} />
      </div>
    </div>
  );
};

export default RealEstateIntelligence;
