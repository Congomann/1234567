import React, { useState, useEffect } from 'react';
import { Search, MapPin, Truck, Filter, ArrowRight, History, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoadSearching: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const popularLanes = [
    { from: 'Chicago, IL', to: 'Dallas, TX', loads: 12 },
    { from: 'Miami, FL', to: 'Atlanta, GA', loads: 8 },
    { from: 'Houston, TX', to: 'Phoenix, AZ', loads: 15 },
    { from: 'Seattle, WA', to: 'Denver, CO', loads: 6 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Hero */}
      <div className="bg-slate-900 pt-48 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Advanced Query Engine
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
              Find Your Next Load.
            </h1>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/10 shadow-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Origin City or Zip"
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:ring-4 ring-blue-500/20 transition-all text-sm"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Destination City or Zip"
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:ring-4 ring-blue-500/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Truck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-5 text-white font-bold focus:outline-none focus:ring-4 ring-blue-500/20 transition-all text-sm appearance-none">
                  <option className="bg-slate-900">All Equipment</option>
                  <option className="bg-slate-900">Dry Van</option>
                  <option className="bg-slate-900">Reefer</option>
                  <option className="bg-slate-900">Flatbed</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button className="flex-1 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] py-5 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3">
                  <Search size={16} /> Search Loads
                </button>
                <button className="p-5 bg-white/5 border border-white/10 text-white rounded-[2rem] hover:bg-white/10 transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Recent & Saved */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <History size={20} className="text-slate-400" /> Recent Searches
                </h3>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clear All</button>
              </div>
              
              <div className="space-y-4">
                {[
                  'Chicago, IL → Dallas, TX (Dry Van)',
                  'Atlanta, GA → Any (Reefer)',
                  'Houston, TX → 500mi (Flatbed)'
                ].map((s, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-6 rounded-2xl border border-slate-50 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <span className="text-sm font-bold text-slate-700">{s}</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
                <Star size={20} className="text-yellow-400 fill-yellow-400" /> Favorite Lanes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularLanes.map((lane, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lane.from} to {lane.to}</p>
                      <p className="text-xs font-bold text-slate-900">{lane.loads} loads available</p>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                      <Search size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
                <TrendingUp size={18} className="text-emerald-500" /> Market Density
              </h3>
              <div className="space-y-6">
                {[
                  { region: 'Midwest', status: 'High', color: 'bg-emerald-500' },
                  { region: 'Southeast', status: 'Moderate', color: 'bg-yellow-500' },
                  { region: 'West Coast', status: 'Low', color: 'bg-slate-300' },
                  { region: 'Northeast', status: 'High', color: 'bg-emerald-500' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">{r.region}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{r.status}</span>
                      <div className={`h-1.5 w-12 rounded-full ${r.color} opacity-20 relative overflow-hidden`}>
                        <div className={`absolute inset-0 ${r.color} ${r.status === 'High' ? 'w-full' : r.status === 'Moderate' ? 'w-1/2' : 'w-1/4'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-black mb-4 tracking-tight">Need a Custom Lane?</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                    Our brokerage team can build dedicated lanes for your specific requirements.
                  </p>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-8 py-4 rounded-full hover:bg-white/10 transition-all">
                    Inquire Now <ArrowRight size={14} />
                  </Link>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
