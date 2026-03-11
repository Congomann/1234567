
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { SERVICE_AREAS } from '../services/geoData';

export const ServiceAreas: React.FC = () => {
  const [expandedState, setExpandedState] = useState<string | null>(null);

  return (
    <div className="bg-[#071930] py-16 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-10 w-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">National Service Areas</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Providing coverage across the United States</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(SERVICE_AREAS).map(([state, cities]) => (
            <div key={state} className="group">
              <button 
                onClick={() => setExpandedState(expandedState === state ? null : state)}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
              >
                <span className="text-sm font-black text-slate-200">{state}</span>
                {expandedState === state ? <ChevronDown size={14} className="text-blue-400" /> : <ChevronRight size={14} className="text-slate-500" />}
              </button>
              
              {expandedState === state && (
                <div className="mt-2 p-4 bg-white/5 rounded-2xl border border-white/5 grid grid-cols-1 gap-1 animate-fade-in">
                  {cities.map(city => (
                    <span key={city} className="text-[11px] font-bold text-slate-400 hover:text-blue-400 cursor-default transition-colors">
                      {city}, {state}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <p className="col-span-full text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Core Competencies</p>
          {[
            "Life Insurance", "Annuities", "IUL", "Retirement Planning", "Mortgages", 
            "Real Estate", "Car Insurance", "Health Insurance", "Final Expense", 
            "Auto Insurance", "Business Insurance", "Wealth Management"
          ].map(kw => (
            <span key={kw} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kw}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
