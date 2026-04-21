import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Filter,
  Navigation,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrailerType, FreightLoad } from '../../types';

/**
 * NHFG LOGISTICS - PUBLIC LOAD BOARD
 * Searchable feed for shippers and carriers on the public web.
 */

export const LoadBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TrailerType | 'All'>('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mockLoads: Partial<FreightLoad>[] = [
    { id: 'LD-4491', origin: 'Chicago, IL', destination: 'Dallas, TX', distance: 960, totalRate: 2850, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T09:00:00Z' },
    { id: 'LD-4492', origin: 'Miami, FL', destination: 'Atlanta, GA', distance: 660, totalRate: 1950, trailerType: TrailerType.REEFER, status: 'Available', createdAt: '2026-04-21T09:15:00Z' },
    { id: 'LD-4493', origin: 'Houston, TX', destination: 'Phoenix, AZ', distance: 1170, totalRate: 3400, trailerType: TrailerType.FLATBED, status: 'Available', createdAt: '2026-04-21T09:30:00Z' },
    { id: 'LD-4494', origin: 'Seattle, WA', destination: 'Denver, CO', distance: 1300, totalRate: 4100, trailerType: TrailerType.HAZMAT, status: 'Available', createdAt: '2026-04-21T09:45:00Z' },
    { id: 'LD-4495', origin: 'Columbus, OH', destination: 'Charlotte, NC', distance: 430, totalRate: 1250, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:00:00Z' },
  ];

  const filteredLoads = mockLoads.filter(load => {
    const matchesSearch = load.origin?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         load.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || load.trailerType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-slate-900 pt-48 pb-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Live Freight Exchange
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
            Global Load Board.
          </h1>
          
          <div className="max-w-4xl mx-auto mt-12 bg-white/5 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search origin or destination city..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-6 py-5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:ring-4 ring-blue-500/20 transition-all text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 md:py-0 px-2 md:px-0">
               {['All', ...Object.values(TrailerType)].map((type) => (
                 <button
                  key={type}
                  onClick={() => setActiveFilter(type as any)}
                  className={`px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeFilter === type 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="mb-12 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Activity</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {filteredLoads.length} Loads available right now
              </h2>
           </div>
           <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Real-time Feed Active</span>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredLoads.length > 0 ? filteredLoads.map((load) => (
            <div 
              key={load.id}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col md:flex-row items-center gap-12"
            >
              {/* Route */}
              <div className="flex-1 flex items-center gap-8">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                   <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{load.origin}</h3>
                      <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{load.destination}</h3>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Navigation size={12} />
                        <span className="text-[11px] font-bold">{load.distance} Miles</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Filter size={12} />
                        <span className="text-[11px] font-bold text-blue-600">{load.trailerType}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Requirements & Rate */}
              <div className="flex items-center gap-12 text-center md:text-left">
                <div className="hidden lg:flex items-center gap-6">
                   <div className="flex flex-col items-center gap-1 opacity-40">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-tight">Clean</span>
                   </div>
                   <div className="flex flex-col items-center gap-1 opacity-40">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Globe size={16} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-tight">Tracked</span>
                   </div>
                </div>

                <div className="px-8 border-x border-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier Pay</p>
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">${load.totalRate?.toLocaleString()}</p>
                </div>

                <Link
                  to="/contact"
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 whitespace-nowrap"
                >
                  Book Now
                </Link>
              </div>
            </div>
          )) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No loads found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your search criteria or trailer type filters.</p>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Industry Leading Rates</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">NHFG uses proprietary lane analysis to ensure our carriers are paid top market value on every mile.</p>
           </div>
           <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Instant Booking</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Our technology eliminates the phone tag. View, select, and book freight in seconds with a single click.</p>
           </div>
           <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Vetted Network</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">We only partner with the most reliable shippers, ensuring high-quality freight and consistent availability.</p>
           </div>
        </div>

      </div>
    </div>
  );
};
