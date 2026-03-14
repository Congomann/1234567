import React, { useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  ArrowUpRight,
  Shield,
  Activity,
  Globe,
  ArrowRight,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialsSection } from "../../components/TestimonialsSection";

const InvestmentRow = ({ name, risk, performance, color }: any) => (
  <div className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
    <div className="flex items-center gap-5 flex-1">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Activity size={24} />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900">{name}</h3>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Investment Instrument</p>
      </div>
    </div>
    <div className="flex items-center gap-12 shrink-0">
      <div className="text-center md:text-left">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Risk Profile</p>
        <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
          risk === 'Low' ? 'bg-emerald-50 text-emerald-600' :
          risk === 'Moderate' ? 'bg-blue-50 text-blue-600' :
          'bg-orange-50 text-orange-600'
        }`}>
          {risk}
        </span>
      </div>
      <div className="text-center md:text-left">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Avg Performance</p>
        <span className="text-base font-black text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-4">{performance}</span>
      </div>
      <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-[#0B2240] group-hover:text-white transition-all">
        <ArrowUpRight size={20} />
      </button>
    </div>
  </div>
);

export const InvestmentShowcase: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const investmentOptions = [
    { name: "Global Equity Alpha", risk: "High", performance: "14.2% YOY", color: "blue" },
    { name: "Fixed Income Bond Bond", risk: "Low", performance: "4.8% YOY", color: "emerald" },
    { name: "Real Estate REIT Fund", risk: "Moderate", performance: "9.5% YOY", color: "purple" },
    { name: "Emerging Market Tech", risk: "High", performance: "18.6% YOY", color: "rose" },
    { name: "Diversified Index Plus", risk: "Moderate", performance: "11.2% YOY", color: "amber" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Asset Management</span>
                <h1 className="text-4xl md:text-6xl font-black text-[#0B2240] tracking-tighter leading-none mb-8">
                    Institutional Wealth <br />
                    <span className="text-slate-400">At Your Fingertips.</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mb-10">
                    Discover diversified portfolios designed by experts. 
                    Monitor performance, understand risks, and grow your wealth with data-driven transparency.
                </p>
                <div className="flex gap-4">
                    <button className="px-8 py-5 bg-[#0B2240] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-900 transition-all">
                        Browse Strategies
                    </button>
                    <button className="px-8 py-5 bg-white text-slate-800 border border-slate-200 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Risk Assessment
                    </button>
                </div>
            </div>
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full"></div>
                <div className="relative bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[3.5rem] shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portfolio Growth</p>
                            <p className="text-2xl font-black text-[#0B2240]">+$45,230.12</p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black">+12.4%</div>
                    </div>
                    {/* Simulated chart line */}
                    <div className="h-48 w-full flex items-end gap-2 mb-6">
                        {[40, 60, 45, 70, 55, 90, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t-xl overflow-hidden relative group">
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-1000" 
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Volatilty</p>
                             <p className="text-sm font-black text-slate-900">LOW (2.4%)</p>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Exposure</p>
                             <p className="text-sm font-black text-slate-900">GLOBAL AGG</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Investment List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex justify-between items-end mb-10">
            <div>
                <h2 className="text-3xl font-black text-[#0B2240] tracking-tighter uppercase">Curated Portfolios</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Historical data based on net asset value (NAV)</p>
            </div>
            <div className="flex gap-2">
                <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Globe size={18} /></button>
                <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><PieChart size={18} /></button>
            </div>
        </div>

        <div className="space-y-4">
          {investmentOptions.map((opt, i) => (
            <InvestmentRow key={i} {...opt} />
          ))}
        </div>
      </div>

      <TestimonialsSection />

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#0B2240] rounded-[3.5rem] p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32"></div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter">
                Secure your financial <br />
                <span className="text-blue-400">legacy today.</span>
            </h2>
            <p className="text-blue-200 text-lg mb-12 max-w-xl mx-auto font-medium">
                Our advisors use high-frequency market intelligence to ensure your portfolio stays resilient in any economic climate.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-6 bg-white text-[#0B2240] rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">
                Open Investment Account <ArrowRight size={18} />
            </Link>
        </div>
      </div>
    </div>
  );
};
