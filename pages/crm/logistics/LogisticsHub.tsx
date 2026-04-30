import React, { useState } from 'react';
import { 
  Truck, 
  Box, 
  Globe, 
  Settings, 
  Container, 
  MapPin, 
  Clock, 
  Navigation, 
  MoreVertical, 
  Plus, 
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { LogisticsNiche } from '../../../types';

interface KanbanDeal {
  id: string;
  title: string;
  value: number;
  client: string;
  nicheSpecificField: string;
}

const TRUCKING_STAGES = ['Dispatched', 'En Route', 'Delivered'];
const FUEL_STAGES = ['Contract Sent', 'Delivered', 'Paid'];
const FREIGHT_STAGES = ['Quoted', 'Carrier Assigned', 'In Transit', 'Delivered'];

export const LogisticsHub: React.FC = () => {
  const [activeNiche, setActiveNiche] = useState<LogisticsNiche>(LogisticsNiche.FREIGHT_BROKERAGE);

  // Mock Deals
  const mockDeals: Record<LogisticsNiche, Record<string, KanbanDeal[]>> = {
    [LogisticsNiche.TRUCKING]: {
      'Dispatched': [{ id: 'TRK-101', title: 'Chicago to Miami (FTL)', value: 4500, client: 'NH Transport', nicheSpecificField: 'Reefer' }],
      'En Route': [{ id: 'TRK-102', title: 'Dallas to LA', value: 5200, client: 'CoolLink', nicheSpecificField: 'Flatbed' }],
      'Delivered': [{ id: 'TRK-103', title: 'Atlanta to NY', value: 1200, client: 'SafeRoute', nicheSpecificField: 'Dry Van' }]
    },
    [LogisticsNiche.FUEL]: {
      'Contract Sent': [{ id: 'FUL-201', title: 'Weekly Diesel Supply', value: 12000, client: 'FleetCorp', nicheSpecificField: '4,000 Gallons' }],
      'Delivered': [{ id: 'FUL-202', title: 'Aviation Fuel Spot', value: 8500, client: 'SkyWest', nicheSpecificField: '2,500 Gallons' }],
      'Paid': []
    },
    [LogisticsNiche.FREIGHT_BROKERAGE]: {
      'Quoted': [{ id: 'FRT-301', title: 'LTL Electronics', value: 1800, client: 'TechSource', nicheSpecificField: 'Electronics' }],
      'Carrier Assigned': [{ id: 'FRT-302', title: 'Hazmat Load', value: 8900, client: 'ChemCorp', nicheSpecificField: 'Hazmat' }],
      'In Transit': [],
      'Delivered': [{ id: 'FRT-303', title: 'Auto Parts', value: 3400, client: 'AutoZone', nicheSpecificField: 'Dry Van' }]
    }
  };

  const getStats = () => {
    switch(activeNiche) {
      case LogisticsNiche.TRUCKING:
        return [
          { label: 'Active Fleet', value: '42', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Miles Driven YTD', value: '1.2M', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$2.1M', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'On-Time Rate', value: '98.5%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ];
      case LogisticsNiche.FUEL:
        return [
          { label: 'Active Contracts', value: '18', icon: Container, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Gallons Moved', value: '450k', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$1.4M', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Margin Average', value: '8.2%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ];
      case LogisticsNiche.FREIGHT_BROKERAGE:
        return [
          { label: 'Active Loads', value: '24', icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Carrier Network', value: '156', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue YTD', value: '$452.8k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'System Health', value: '99.8%', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' }
        ];
    }
  };

  const getStages = () => {
    switch(activeNiche) {
      case LogisticsNiche.TRUCKING: return TRUCKING_STAGES;
      case LogisticsNiche.FUEL: return FUEL_STAGES;
      case LogisticsNiche.FREIGHT_BROKERAGE: return FREIGHT_STAGES;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
              <Truck size={24} />
            </div>
            Logistics Command Center
          </h1>
          <p className="text-slate-500 font-medium mt-2">Managing global freight, brokerage, and dispatch operations.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-3xl">
          {Object.values(LogisticsNiche).map((niche) => (
            <button
              key={niche}
              onClick={() => setActiveNiche(niche)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeNiche === niche
                  ? 'bg-white text-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
                  : 'text-slate-400 hover:bg-white/50'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {getStats().map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-8 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{activeNiche} Pipeline</h3>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-[0_8px_20px_rgb(15,23,42,0.3)]">
            <Plus size={14} /> New Deal
          </button>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-6 snap-x">
          {getStages().map((stage) => (
            <div key={stage} className="flex-1 min-w-[300px] snap-center">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{stage}</h4>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                  {mockDeals[activeNiche][stage]?.length || 0}
                </span>
              </div>
              <div className="space-y-4">
                {mockDeals[activeNiche][stage]?.map((deal) => (
                  <div key={deal.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{deal.id}</span>
                      <MoreVertical size={14} className="text-slate-300" />
                    </div>
                    <h5 className="font-bold text-slate-900 mb-1">{deal.title}</h5>
                    <p className="text-sm text-slate-500 mb-4">{deal.client}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{deal.nicheSpecificField}</span>
                      <span className="font-black text-slate-900">${deal.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {(!mockDeals[activeNiche][stage] || mockDeals[activeNiche][stage].length === 0) && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Deals</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
