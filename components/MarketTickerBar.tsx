import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, Activity, DollarSign, Lock } from 'lucide-react';

export const MarketTickerBar: React.FC = () => {
  const tickerItems = [
    { label: '30-Yr Fixed Mortgage', value: '6.38%', change: '-0.04%', positive: true },
    { label: '10-Yr Treasury Yield', value: '4.16%', change: '+0.02%', positive: true },
    { label: 'S&P 500 Index', value: '5,492.30', change: '+0.45%', positive: true },
    { label: 'Term Life Benchmark (30yo)', value: '$22/mo', change: 'Fixed Rate', positive: true },
    { label: 'Dry Van Freight Rate', value: '$2.48/mi', change: '+1.2%', positive: true },
    { label: 'System Status', value: '99.99% Uptime', change: 'SOC2 Certified', positive: true },
    { label: 'Plaid Bank Verification', value: 'Live', change: 'Instant Sync', positive: true },
  ];

  return (
    <div className="bg-[#040812] text-slate-300 text-[11px] font-mono border-b border-white/10 overflow-hidden select-none py-2 relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-blue-400 font-bold shrink-0">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
          <span className="text-[10px] tracking-wider uppercase font-sans">Institutional Market Intel</span>
        </div>

        {/* Scrolling Ticker Stream */}
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap mask-gradient">
          {tickerItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-slate-300 shrink-0 font-medium">
              <span className="text-slate-400 uppercase tracking-wider">{item.label}:</span>
              <span className="text-white font-bold">{item.value}</span>
              <span className={`text-[10px] font-bold ${item.positive ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-0.5`}>
                {item.change.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {item.change}
              </span>
            </div>
          ))}
        </div>

        {/* Right Security Badge */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400 font-sans text-[10px] shrink-0 font-semibold">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
