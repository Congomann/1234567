import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Zap,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Calendar,
  ArrowUpRight,
  Layers,
  Activity,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Timeframe = '7D' | '30D' | '90D' | 'YTD' | '1Y';

interface ChartDataItem {
  label: string;
  revenue: number;
  aum: number;
}

interface ChannelDataItem {
  channel: string;
  leads: number;
  converted: number;
  fill: string;
}

interface VerticalDataItem {
  name: string;
  value: number;
  color: string;
}

interface TimeframeData {
  areaData: ChartDataItem[];
  barData: ChannelDataItem[];
  pieData: VerticalDataItem[];
  kpi: {
    totalAum: string;
    aumGrowth: string;
    totalLeads: number;
    leadsGrowth: string;
    conversionRate: string;
  };
}

const TIMEFRAME_DATA: Record<Timeframe, TimeframeData> = {
  '7D': {
    areaData: [
      { label: 'Mon', revenue: 2.1, aum: 138.2 },
      { label: 'Tue', revenue: 2.4, aum: 139.1 },
      { label: 'Wed', revenue: 2.8, aum: 140.5 },
      { label: 'Thu', revenue: 3.1, aum: 141.2 },
      { label: 'Fri', revenue: 3.5, aum: 142.0 },
      { label: 'Sat', revenue: 3.4, aum: 142.4 },
      { label: 'Sun', revenue: 3.6, aum: 142.8 }
    ],
    barData: [
      { channel: 'Meta Ads', leads: 145, converted: 48, fill: '#00f2fe' },
      { channel: 'Google Search', leads: 190, converted: 72, fill: '#10b981' },
      { channel: 'TV Broadcast', leads: 85, converted: 22, fill: '#f43f5e' },
      { channel: 'Direct / Referral', leads: 110, converted: 55, fill: '#8b5cf6' }
    ],
    pieData: [
      { name: 'Securities & Wealth', value: 64.2, color: '#00f2fe' },
      { name: 'Real Estate & Escrow', value: 35.7, color: '#8e2de2' },
      { name: 'Commercial Insurance', value: 21.4, color: '#10b981' },
      { name: 'Mortgage Banking', value: 14.3, color: '#f43f5e' },
      { name: 'Logistics Tech', value: 7.2, color: '#f59e0b' }
    ],
    kpi: {
      totalAum: '$142.8M',
      aumGrowth: '+3.3%',
      totalLeads: 530,
      leadsGrowth: '+12.4%',
      conversionRate: '37.2%'
    }
  },
  '30D': {
    areaData: [
      { label: 'Week 1', revenue: 9.8, aum: 128.4 },
      { label: 'Week 2', revenue: 11.2, aum: 132.1 },
      { label: 'Week 3', revenue: 12.9, aum: 137.6 },
      { label: 'Week 4', revenue: 14.6, aum: 142.8 }
    ],
    barData: [
      { channel: 'Meta Ads', leads: 520, converted: 185, fill: '#00f2fe' },
      { channel: 'Google Search', leads: 740, converted: 290, fill: '#10b981' },
      { channel: 'TV Broadcast', leads: 310, converted: 92, fill: '#f43f5e' },
      { channel: 'Direct / Referral', leads: 420, converted: 215, fill: '#8b5cf6' }
    ],
    pieData: [
      { name: 'Securities & Wealth', value: 62.8, color: '#00f2fe' },
      { name: 'Real Estate & Escrow', value: 37.1, color: '#8e2de2' },
      { name: 'Commercial Insurance', value: 22.8, color: '#10b981' },
      { name: 'Mortgage Banking', value: 13.6, color: '#f43f5e' },
      { name: 'Logistics Tech', value: 6.5, color: '#f59e0b' }
    ],
    kpi: {
      totalAum: '$142.8M',
      aumGrowth: '+11.2%',
      totalLeads: 1990,
      leadsGrowth: '+18.6%',
      conversionRate: '39.3%'
    }
  },
  '90D': {
    areaData: [
      { label: 'Month 1', revenue: 28.5, aum: 118.0 },
      { label: 'Month 2', revenue: 34.2, aum: 129.5 },
      { label: 'Month 3', revenue: 41.8, aum: 142.8 }
    ],
    barData: [
      { channel: 'Meta Ads', leads: 1540, converted: 560, fill: '#00f2fe' },
      { channel: 'Google Search', leads: 2210, converted: 890, fill: '#10b981' },
      { channel: 'TV Broadcast', leads: 920, converted: 280, fill: '#f43f5e' },
      { channel: 'Direct / Referral', leads: 1280, converted: 640, fill: '#8b5cf6' }
    ],
    pieData: [
      { name: 'Securities & Wealth', value: 61.5, color: '#00f2fe' },
      { name: 'Real Estate & Escrow', value: 38.5, color: '#8e2de2' },
      { name: 'Commercial Insurance', value: 24.0, color: '#10b981' },
      { name: 'Mortgage Banking', value: 12.8, color: '#f43f5e' },
      { name: 'Logistics Tech', value: 6.0, color: '#f59e0b' }
    ],
    kpi: {
      totalAum: '$142.8M',
      aumGrowth: '+21.0%',
      totalLeads: 5950,
      leadsGrowth: '+24.1%',
      conversionRate: '39.8%'
    }
  },
  'YTD': {
    areaData: [
      { label: 'Jan', revenue: 8.2, aum: 105.0 },
      { label: 'Feb', revenue: 12.5, aum: 110.2 },
      { label: 'Mar', revenue: 18.1, aum: 116.8 },
      { label: 'Apr', revenue: 23.4, aum: 122.4 },
      { label: 'May', revenue: 29.8, aum: 128.9 },
      { label: 'Jun', revenue: 35.6, aum: 134.5 },
      { label: 'Jul', revenue: 41.2, aum: 139.0 },
      { label: 'Aug', revenue: 48.5, aum: 142.8 }
    ],
    barData: [
      { channel: 'Meta Ads', leads: 4100, converted: 1520, fill: '#00f2fe' },
      { channel: 'Google Search', leads: 5800, converted: 2350, fill: '#10b981' },
      { channel: 'TV Broadcast', leads: 2400, converted: 780, fill: '#f43f5e' },
      { channel: 'Direct / Referral', leads: 3200, converted: 1650, fill: '#8b5cf6' }
    ],
    pieData: [
      { name: 'Securities & Wealth', value: 65.6, color: '#00f2fe' },
      { name: 'Real Estate & Escrow', value: 35.7, color: '#8e2de2' },
      { name: 'Commercial Insurance', value: 22.8, color: '#10b981' },
      { name: 'Mortgage Banking', value: 12.8, color: '#f43f5e' },
      { name: 'Logistics Tech', value: 5.9, color: '#f59e0b' }
    ],
    kpi: {
      totalAum: '$142.8M',
      aumGrowth: '+36.0%',
      totalLeads: 15500,
      leadsGrowth: '+31.2%',
      conversionRate: '40.6%'
    }
  },
  '1Y': {
    areaData: [
      { label: 'Q3 Prev', revenue: 15.2, aum: 98.4 },
      { label: 'Q4 Prev', revenue: 24.8, aum: 104.2 },
      { label: 'Q1', revenue: 32.1, aum: 116.8 },
      { label: 'Q2', revenue: 42.6, aum: 134.5 },
      { label: 'Q3 Curr', revenue: 54.0, aum: 142.8 }
    ],
    barData: [
      { channel: 'Meta Ads', leads: 6200, converted: 2310, fill: '#00f2fe' },
      { channel: 'Google Search', leads: 8900, converted: 3620, fill: '#10b981' },
      { channel: 'TV Broadcast', leads: 3600, converted: 1140, fill: '#f43f5e' },
      { channel: 'Direct / Referral', leads: 4900, converted: 2510, fill: '#8b5cf6' }
    ],
    pieData: [
      { name: 'Securities & Wealth', value: 64.2, color: '#00f2fe' },
      { name: 'Real Estate & Escrow', value: 35.7, color: '#8e2de2' },
      { name: 'Commercial Insurance', value: 21.4, color: '#10b981' },
      { name: 'Mortgage Banking', value: 14.3, color: '#f43f5e' },
      { name: 'Logistics Tech', value: 7.2, color: '#f59e0b' }
    ],
    kpi: {
      totalAum: '$142.8M',
      aumGrowth: '+45.1%',
      totalLeads: 23600,
      leadsGrowth: '+41.8%',
      conversionRate: '40.6%'
    }
  }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  isCurrency = false,
  prefix = '',
  suffix = ''
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="apple-glass-dark p-4 rounded-2xl border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] text-slate-100 min-w-[200px] backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
      </div>
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const val = entry.value;
          let formattedVal = '';
          if (isCurrency) {
            formattedVal = `$${typeof val === 'number' ? val.toFixed(1) : val}M`;
          } else {
            formattedVal = `${prefix}${typeof val === 'number' ? val.toLocaleString() : val}${suffix}`;
          }

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: entry.color || entry.fill, color: entry.color || entry.fill }}
                />
                <span className="text-slate-300">{entry.name}:</span>
              </div>
              <span
                className="font-mono font-extrabold tracking-tight"
                style={{ color: entry.color || entry.fill || '#38bdf8' }}
              >
                {formattedVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CRMAnalyticsCharts: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const currentData = TIMEFRAME_DATA[timeframe];

  return (
    <div className="relative mb-10 overflow-hidden apple-glass-dark rounded-[2.5rem] p-6 md:p-10 border border-cyan-500/20 shadow-2xl text-slate-100">
      
      {/* SVG Neon Glow Definitions */}
      <svg width="0" height="0" className="absolute top-0 left-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <filter id="neon-cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-pink-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-emerald-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-purple-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Decorative Neon Background Ambient Flares */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER & TIMEFRAME SELECTOR ── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-extrabold uppercase tracking-widest mb-3 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Animated Analytics Command Center
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            CRM Financial Metrics & Performance Trends
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Real-time AUM growth, lead acquisition multi-channel breakdown, and asset vertical allocation
          </p>
        </div>

        {/* Stateful Timeframe Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <div className="flex items-center gap-1 px-2.5 text-slate-400 text-xs font-bold mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Range:</span>
          </div>
          {(['7D', '30D', '90D', 'YTD', '1Y'] as Timeframe[]).map((tf) => {
            const active = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                  active
                    ? 'text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTimeframeGlow"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl border border-cyan-300/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tf}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI HIGHLIGHT BADGES ── */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Total AUM</span>
            <span className="text-emerald-400 flex items-center gap-0.5 text-[11px] font-extrabold">
              <ArrowUpRight className="w-3 h-3" /> {currentData.kpi.aumGrowth}
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            {currentData.kpi.totalAum}
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Acquired Leads</span>
            <span className="text-emerald-400 flex items-center gap-0.5 text-[11px] font-extrabold">
              <ArrowUpRight className="w-3 h-3" /> {currentData.kpi.leadsGrowth}
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            {currentData.kpi.totalLeads.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Conversion Rate</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black font-mono text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            {currentData.kpi.conversionRate}
          </p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-rose-500/20 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Active Channel</span>
            <Zap className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          </div>
          <p className="text-2xl font-black text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">
            Google / Meta
          </p>
        </div>
      </div>

      {/* ── CHARTS GRID ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* 1. AREA CHART: AUM & Revenue Growth (8 Cols on LG) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-8 bg-slate-900/70 p-6 rounded-3xl border border-cyan-500/20 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">AUM & Revenue Growth Trends</h3>
                <p className="text-xs text-slate-400">Managed Assets ($M) vs Enterprise Fee Revenue ($M)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" /> AUM ($M)
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#8e2de2]" /> Revenue ($M)
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8e2de2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8e2de2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <Tooltip content={<CustomTooltip isCurrency />} />
                <Area
                  type="monotone"
                  dataKey="aum"
                  name="Assets Under Mgmt"
                  stroke="#00f2fe"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAum)"
                  filter="url(#neon-cyan-glow)"
                  activeDot={{ r: 6, fill: '#00f2fe', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Fee Revenue"
                  stroke="#8e2de2"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  filter="url(#neon-pink-glow)"
                  activeDot={{ r: 6, fill: '#8e2de2', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. DONUT PIE CHART: Product Vertical Distribution (4 Cols on LG) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4 bg-slate-900/70 p-6 rounded-3xl border border-purple-500/20 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Vertical Asset Split</h3>
              <p className="text-xs text-slate-400">Distribution across product hubs</p>
            </div>
          </div>

          <div className="h-[210px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip suffix="M" prefix="$" />} />
                <Pie
                  data={currentData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  filter="url(#neon-purple-glow)"
                >
                  {currentData.pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="rgba(15, 23, 42, 0.8)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Donut Label */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">AUM Split</span>
              <span className="text-lg font-black font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                100%
              </span>
            </div>
          </div>

          {/* Vertical Legend */}
          <div className="space-y-1.5 mt-2 pt-3 border-t border-white/10">
            {currentData.pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                  />
                  <span className="text-slate-300 text-[11px] truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-mono text-slate-200 text-[11px]">${item.value}M</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. BAR CHART: Lead Acquisition by Channel (12 Cols on LG) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-12 bg-slate-900/70 p-6 rounded-3xl border border-emerald-500/20 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Lead Acquisition by Channel</h3>
                <p className="text-xs text-slate-400">Total inbound lead volume vs converted high-net-worth clients</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_8px_#00f2fe]" /> Total Inbound Leads
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-sm bg-emerald-400 shadow-[0_0_8px_#10b981]" /> Qualified & Converted
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis dataKey="channel" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <Tooltip content={<CustomTooltip suffix=" leads" />} />
                <Bar
                  dataKey="leads"
                  name="Total Inbound"
                  fill="#00f2fe"
                  radius={[6, 6, 0, 0]}
                  filter="url(#neon-cyan-glow)"
                />
                <Bar
                  dataKey="converted"
                  name="Converted HNW"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  filter="url(#neon-emerald-glow)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CRMAnalyticsCharts;
