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
    <div className="bg-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="absolute h-[600px] w-[600px] bg-blue-500/5 blur-[120px] rounded-full -top-48 -right-24 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-left">
              <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                Capital Management
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1] uppercase">
                Institutional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Strategy.</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl font-medium mb-12">
                NHFG engineers sophisticated portfolios for high-net-worth 
                trajectories. Modern performance meets legacy-grade stability.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button className="px-10 py-5 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95">
                  Launch Terminal
                </button>
                <button className="px-10 py-5 bg-blue-600/20 text-white border border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md">
                  View Prospectus
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[3.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregated Yield</p>
                      <p className="text-2xl font-black text-white">$2.4M+</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20">
                    +18.42%
                  </div>
                </div>

                <div className="h-48 w-full flex items-end gap-3 mb-10">
                  {[40, 65, 50, 85, 60, 95, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-xl overflow-hidden relative group/bar">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-emerald-400 opacity-60 group-hover/bar:opacity-100 transition-all duration-1000" 
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Sharp Ratio</p>
                      <p className="text-sm font-black text-white">2.84 (OPTIMAL)</p>
                   </div>
                   <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Alpha Index</p>
                      <p className="text-sm font-black text-white">GENERATE 4.2%</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Market Strategies</h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">Active Portfolios.</p>
          </div>
          <div className="flex gap-3">
             <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Globe size={20} /></button>
             <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><PieChart size={20} /></button>
          </div>
        </div>

        <div className="space-y-6">
          {investmentOptions.map((opt, i) => (
            <div key={i} className="group bg-white p-10 rounded-[3rem] border border-slate-100 hover:shadow-3xl hover:-translate-y-1 transition-all flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-blue-50 transition-colors"></div>
               
               <div className="flex items-center gap-8 flex-1 w-full">
                  <div className={`w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-900 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#0B2240] group-hover:text-white transition-all`}>
                    <Activity size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{opt.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">NAV ID: NHFG-{104 + i}</span>
                      <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                      <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Global Exposure</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full lg:w-auto items-center">
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Factor</p>
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full border ${
                      opt.risk === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      opt.risk === 'Moderate' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {opt.risk} Profile
                    </span>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Yield</p>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{opt.performance}</span>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-center lg:justify-end">
                    <button className="h-16 w-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all shadow-xl group-hover:translate-x-2">
                      <ArrowUpRight size={28} />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <TestimonialsSection />

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="bg-[#0B2240] rounded-[5rem] p-16 md:p-32 text-center shadow-4xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter uppercase leading-[0.9]">
                Architect Your <br />
                <span className="text-blue-500">Wealth Legacy.</span>
              </h2>
              <p className="text-blue-100/70 text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                Join the executive circle and gain access to proprietary wealth management strategies 
                engineered for market dominance.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-4 px-14 py-7 bg-white text-[#0B2240] rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-50 transition-all shadow-3xl hover:scale-105 active:scale-95 group/btn">
                Establish Account <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};
