import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Shield,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Info,
  DollarSign,
  Briefcase,
  Zap,
  Target,
} from "lucide-react";
import { SpeakToAdvisorForm } from "../../components/SpeakToAdvisorForm";
import { ProductType, UserRole, AdvisorCategory } from "../../types";
import { useData } from "../../context/DataContext";
import { PDFBrandingService } from "../../services/pdfBrandingService";
import { jsPDF } from "jspdf";
import { Lock, FileDown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type RiskProfile = "conservative" | "balanced" | "aggressive" | "hyper-growth";

const RISK_PROFILES: Record<RiskProfile, {
  name: string;
  description: string;
  allocation: { name: string; value: number; color: string }[];
  expectedReturn: number;
  volatility: number;
  holdings: string[];
}> = {
  conservative: {
    name: "Conservative",
    description: "Prioritizes capital preservation and steady income with minimal volatility.",
    allocation: [
      { name: "Government Bonds", value: 60, color: "#3B82F6" },
      { name: "Corporate Bonds", value: 15, color: "#60A5FA" },
      { name: "Dividend Equities", value: 15, color: "#10B981" },
      { name: "Cash / Alternatives", value: 10, color: "#94A3B8" },
    ],
    expectedReturn: 4.2,
    volatility: 5.5,
    holdings: ["Vanguard Total Bond Market ETF", "iShares Core U.S. Aggregate Bond", "Schwab US Dividend Equity ETF", "Gold Bullion Trust"],
  },
  balanced: {
    name: "Balanced",
    description: "A hybrid approach seeking both growth and income with moderate risk tolerance.",
    allocation: [
      { name: "U.S. Equities", value: 40, color: "#3B82F6" },
      { name: "International Equities", value: 10, color: "#60A5FA" },
      { name: "Fixed Income", value: 40, color: "#10B981" },
      { name: "Real Estate / Alts", value: 10, color: "#F59E0B" },
    ],
    expectedReturn: 7.5,
    volatility: 9.2,
    holdings: ["Vanguard Total Stock Market", "iShares Core S&P 500", "Vanguard Total International Stock", "Schwab US Aggregate Bond"],
  },
  aggressive: {
    name: "Aggressive",
    description: "Maximizes long-term growth through high equity exposure and strategic alternatives.",
    allocation: [
      { name: "U.S. Large Cap", value: 50, color: "#3B82F6" },
      { name: "Tech / Innovation", value: 20, color: "#60A5FA" },
      { name: "Emerging Markets", value: 15, color: "#10B981" },
      { name: "Private Equity", value: 15, color: "#8B5CF6" },
    ],
    expectedReturn: 11.2,
    volatility: 14.8,
    holdings: ["Invesco QQQ Trust", "ARK Innovation ETF", "iShares MSCI Emerging Markets", "Vanguard Information Tech"],
  },
  "hyper-growth": {
    name: "Hyper-Growth",
    description: "Unrestricted pursuit of maximum returns using concentrated sector bets and digital assets.",
    allocation: [
      { name: "Innovation / Disruptive", value: 40, color: "#8B5CF6" },
      { name: "Small Cap Growth", value: 25, color: "#EC4899" },
      { name: "Crypto / Digital Assets", value: 20, color: "#F59E0B" },
      { name: "Venture Capital", value: 15, color: "#3B82F6" },
    ],
    expectedReturn: 16.8,
    volatility: 22.4,
    holdings: ["VanEck Digital Transformation ETF", "Vanguard Small-Cap Growth", "Bitcoin / Ethereum Core", "Renaissance IPO ETF"],
  },
};

export const SecuritiesPortfolio: React.FC = () => {
  const { user } = useData();
  const [activeProfile, setActiveProfile] = useState<RiskProfile>("balanced");
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [isGenerating, setIsGenerating] = useState(false);

  // AUTH GUARD: Only Securities Advisors or Admin can access
  const isAuthorized = user?.role === UserRole.ADMIN || 
                      (user?.role === UserRole.ADVISOR && user?.category === AdvisorCategory.SECURITIES);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 bg-white">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Advisor Console Only</h2>
          <p className="text-slate-500 font-medium">
            The Strategic Wealth Engine is reserved for internal NHFG Securities & Investment Advisors only.
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

  const handleDownloadStrategy = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    const profile = RISK_PROFILES[activeProfile];
    
    PDFBrandingService.addHeader(doc, "SECURITIES STRATEGY ANALYSIS");
    
    doc.setFontSize(16);
    doc.setTextColor(11, 34, 64);
    doc.text(`Model: ${profile.name} Portfolio`, 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Investment Amount: $${investmentAmount.toLocaleString()}`, 14, 70);
    doc.text(`Expected Annual Return: ${profile.expectedReturn}%`, 14, 75);
    doc.text(`Annual Volatility: ${profile.volatility}%`, 14, 80);

    doc.setFontSize(12);
    doc.setTextColor(11, 34, 64);
    doc.text("Asset Allocation", 14, 95);
    
    profile.allocation.forEach((item, idx) => {
        doc.text(`${item.name}: ${item.value}%`, 20, 105 + (idx * 7));
    });

    PDFBrandingService.addFooter(doc);
    doc.save(`NHFG_Strategy_${profile.name}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const chartData = useMemo(() => {
    const data = [];
    const profile = RISK_PROFILES[activeProfile];
    let currentValue = investmentAmount;
    
    for (let year = 0; year <= 10; year++) {
      data.push({
        year: `Year ${year}`,
        value: Math.round(currentValue),
      });
      currentValue *= (1 + (profile.expectedReturn / 100));
    }
    return data;
  }, [activeProfile, investmentAmount]);

  const profile = RISK_PROFILES[activeProfile];

  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Zap className="w-4 h-4" />
            Strategic Wealth Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Portfolio <span className="text-blue-600">Visualizer</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Project your wealth growth across diverse market conditions with our proprietary risk-adjusted modeling engine.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Investment Input */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Initial Investment
            </h3>
            <div className="relative mb-8">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-3">
              {[5000, 10000, 25000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setInvestmentAmount(amt)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${investmentAmount === amt ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Selector */}
          <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Risk Profile Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(Object.keys(RISK_PROFILES) as RiskProfile[]).map(key => {
                const isActive = activeProfile === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveProfile(key)}
                    className={`
                      relative p-6 rounded-[2rem] border-2 transition-all group text-left
                      ${isActive ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 hover:border-blue-200 hover:bg-slate-50'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500'}`}>
                      {key === 'conservative' && <Shield className="w-5 h-5" />}
                      {key === 'balanced' && <Briefcase className="w-5 h-5" />}
                      {key === 'aggressive' && <TrendingUp className="w-5 h-5" />}
                      {key === 'hyper-growth' && <Zap className="w-5 h-5" />}
                    </div>
                    <div className="font-black text-slate-900 uppercase tracking-tighter text-sm mb-1">{RISK_PROFILES[key].name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{RISK_PROFILES[key].expectedReturn}% Target</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                "{profile.description}"
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Performance Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Projection</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">10-Year Cumulative Return</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-500">+{(chartData[10].value - investmentAmount).toLocaleString()}</div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Est. Net Profit</p>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}}
                    tickFormatter={(val) => `$${(val / 1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-900/5">
             <div className="mb-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Asset Allocation</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Strategic Diversification</p>
              </div>

              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profile.allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {profile.allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-3xl font-black text-slate-900">{profile.expectedReturn}%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg. Yield</div>
                </div>
              </div>

              <div className="space-y-3 mt-8">
                {profile.allocation.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Strategy Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {/* Key Metrics */}
          <div className="bg-[#0B2240] p-12 rounded-[3.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><TrendingUp size={200} strokeWidth={1} /></div>
            <h3 className="text-2xl font-black tracking-tight mb-8 relative z-10">Strategy Statistics</h3>
            
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div>
                <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Annualized Return</div>
                <div className="text-4xl font-black">{profile.expectedReturn}%</div>
              </div>
              <div>
                <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sharpe Ratio</div>
                <div className="text-4xl font-black">{(profile.expectedReturn / profile.volatility).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Annual Volatility</div>
                <div className="text-4xl font-black">{profile.volatility}%</div>
              </div>
              <div>
                <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Risk Rating</div>
                <div className="text-4xl font-black flex items-center gap-2">
                  {profile.volatility < 8 ? 'Low' : profile.volatility < 12 ? 'Med' : 'High'}
                  <div className={`h-3 w-3 rounded-full ${profile.volatility < 8 ? 'bg-emerald-400' : profile.volatility < 12 ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <ArrowUpRight className="text-blue-400" />
              </div>
              <p className="text-xs text-blue-100/60 font-medium leading-relaxed">
                Our quantitative modeling indicates a 95% confidence interval for these projections based on historical asset class correlations.
              </p>
            </div>
          </div>

          {/* Model Holdings */}
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Model Holdings</h3>
            <div className="space-y-4">
              {profile.holdings.map((holding, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:bg-blue-50 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{holding}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Asset Component</div>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:border-blue-200 transition-all">
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleDownloadStrategy}
              disabled={isGenerating}
              className="w-full mt-8 py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Download Strategy PDF
            </button>
          </div>
        </div>

        {/* Action Panel */}
        <div className="max-w-4xl mx-auto mb-24 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tight">Ready to Deploy?</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-2xl mx-auto">
                Move from projection to execution. Establish a secure connection with our portfolio management team to begin the institutional onboarding process.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
                <button 
                    onClick={() => document.getElementById('speak-to-advisor')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-12 py-6 bg-[#0B2240] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                >
                    Establish Connection
                </button>
            </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto p-8 bg-slate-100/50 rounded-[2rem] border border-slate-200/60 mb-20">
          <div className="flex gap-4">
            <Info className="w-6 h-6 text-slate-400 shrink-0" />
            <div className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
              <strong>ACTUARIAL & REGULATORY DISCLAIMER:</strong> These projections are hypothetical and for educational purposes only. They do not constitute an offer to buy or sell securities. Past performance is not indicative of future results. All investments involve risk, including the loss of principal. Securities and advisory services offered through NHFG Investment Advisory, a registered investment advisor. Returns are modeled using the NHFG Quantitative Engine v4.2 based on historical asset class performance (2000-2024).
            </div>
          </div>
        </div>

        <SpeakToAdvisorForm productType={ProductType.SECURITIES} />
      </div>
    </div>
  );
};

export default SecuritiesPortfolio;
