import React, { useState, useEffect } from 'react';
import { Truck, MapPin, ArrowRight, CheckCircle2, Globe, Filter, Navigation, DollarSign, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrailerType, FreightLoad } from '../../types';

export const LoadListing: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mockLoads: Partial<FreightLoad>[] = [
    { id: 'LD-4491', origin: 'Chicago, IL', destination: 'Dallas, TX', distance: 960, totalRate: 2850, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T09:00:00Z' },
    { id: 'LD-4492', origin: 'Miami, FL', destination: 'Atlanta, GA', distance: 660, totalRate: 1950, trailerType: TrailerType.REEFER, status: 'Available', createdAt: '2026-04-21T09:15:00Z' },
    { id: 'LD-4493', origin: 'Houston, TX', destination: 'Phoenix, AZ', distance: 1170, totalRate: 3400, trailerType: TrailerType.FLATBED, status: 'Available', createdAt: '2026-04-21T09:30:00Z' },
    { id: 'LD-4494', origin: 'Seattle, WA', destination: 'Denver, CO', distance: 1300, totalRate: 4100, trailerType: TrailerType.HAZMAT, status: 'Available', createdAt: '2026-04-21T09:45:00Z' },
    { id: 'LD-4495', origin: 'Columbus, OH', destination: 'Charlotte, NC', distance: 430, totalRate: 1250, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:00:00Z' },
    { id: 'LD-4496', origin: 'New York, NY', destination: 'Boston, MA', distance: 215, totalRate: 950, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:15:00Z' },
    { id: 'LD-4497', origin: 'Los Angeles, CA', destination: 'San Francisco, CA', distance: 380, totalRate: 1400, trailerType: TrailerType.VAN, status: 'Available', createdAt: '2026-04-21T10:30:00Z' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Feed Header */}
      <div className="bg-slate-900 pt-48 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              Real-time Supply Chain Feed
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Active Load Feed.
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem]">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Available</span>
                <span className="text-3xl font-black text-white tracking-tighter">{mockLoads.length} Loads</span>
             </div>
             <div className="h-10 w-px bg-white/10 mx-4 hidden md:block"></div>
             <button className="px-8 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3">
               Refresh Feed <Globe size={14} className="animate-spin-slow" />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-32">
        <div className="grid grid-cols-1 gap-6">
          {mockLoads.map((load) => (
            <div 
              key={load.id}
              className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col lg:flex-row items-center gap-12"
            >
              {/* Route Info */}
              <div className="flex-1 flex items-center gap-10">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <Truck size={32} />
                </div>
                <div>
                   <div className="flex flex-wrap items-center gap-6 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Origin</span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{load.origin}</h3>
                      </div>
                      <ArrowRight size={24} className="text-slate-200 mt-4 group-hover:translate-x-3 transition-transform duration-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{load.destination}</h3>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Navigation size={14} className="text-slate-300" />
                        {load.distance} Miles
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                        {load.trailerType}
                      </div>
                   </div>
                </div>
              </div>

              {/* Status & Pay */}
              <div className="flex flex-wrap items-center justify-center gap-12 lg:pl-12 lg:border-l border-slate-50">
                 <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                      <CheckCircle2 size={16} /> {load.status}
                    </div>
                 </div>
                 
                 <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier Rate</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      ${load.totalRate?.toLocaleString()}
                    </p>
                 </div>

                 <div className="flex gap-3">
                   <Link
                     to="/logistics/booking"
                     className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
                   >
                     Book Load
                   </Link>
                   <button className="p-5 bg-slate-50 text-slate-400 border border-slate-100 rounded-[1.5rem] hover:bg-slate-100 transition-colors">
                     <ExternalLink size={18} />
                   </button>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boarding Info */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex gap-8 items-start">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign size={28} />
              </div>
              <div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight mb-3">QuickPay Options</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">
                   Get paid in as little as 24 hours with our premium QuickPay factoring partners. 
                   We value your cash flow.
                 </p>
              </div>
           </div>
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex gap-8 items-start">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <Globe size={28} />
              </div>
              <div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight mb-3">National Coverage</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">
                   Access freight in all 48 lower states. Our network spans every major 
                   shipping hub and industrial corridor.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
