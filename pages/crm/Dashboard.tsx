import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  Users, Wallet, TrendingUp, Activity, ArrowUpRight,
  ShieldCheck, ArrowRight, Zap, RefreshCw, MessageSquare, Phone,
  FileText, CheckCircle2, Radio, Sparkles, Building2, Landmark,
  Percent, Truck, Plus, Trash2, ShieldAlert, Key, Award, Flame,
  Clock, CheckSquare, Calendar as CalendarIcon, Download, Filter, Eye, ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';

export const Dashboard: React.FC = () => {
  const { user, leads } = useData();
  const navigate = useNavigate();

  // Selected filters
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('Feb 2026');

  // Interactive Pie Chart Active Segment
  const [activePieSegment, setActivePieSegment] = useState<'facebook' | 'youtube' | 'instagram' | 'website'>('instagram');

  return (
    <div className="min-h-screen bg-[#121318] text-slate-100 p-6 lg:p-8 font-sans selection:bg-purple-500/30">
      
      {/* ── TOP BANNER 3D CARDS (MATCHING USER SCREENSHOT TOP ROW) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Weekly Balance */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 p-7 text-slate-950 shadow-2xl transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-sm font-extrabold text-slate-900/80 tracking-tight block mb-1">Weekly Balance</span>
              <h2 className="text-4xl font-black text-slate-950 tracking-tight mb-4">$20k</h2>
              <button onClick={() => navigate('/crm/securities')} className="text-xs font-black underline text-slate-950 hover:opacity-80">
                View entire list &rarr;
              </button>
            </div>
            
            {/* 3D Floating Wallet Graphic */}
            <div className="w-24 h-24 relative flex items-center justify-center animate-bounce duration-1000">
              <div className="w-20 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl shadow-xl transform rotate-12 border-2 border-white/40 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-amber-950" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-black text-xs text-amber-950">
                $
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Orders In Line */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 p-7 text-slate-950 shadow-2xl transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-sm font-extrabold text-slate-900/80 tracking-tight block mb-1">Orders In Line</span>
              <h2 className="text-4xl font-black text-slate-950 tracking-tight mb-4">750</h2>
              <button onClick={() => navigate('/crm/leads')} className="text-xs font-black underline text-slate-950 hover:opacity-80">
                View entire list &rarr;
              </button>
            </div>

            {/* 3D Floating Shopping Phone Graphic */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="w-16 h-20 bg-slate-900 rounded-2xl border-2 border-white/60 shadow-2xl transform -rotate-6 p-2 flex flex-col items-center justify-between">
                <div className="w-6 h-1 bg-slate-700 rounded-full" />
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-slate-950" />
                </div>
                <div className="w-4 h-4 bg-emerald-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: New Clients */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 p-7 text-slate-950 shadow-2xl transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-sm font-extrabold text-slate-900/80 tracking-tight block mb-1">New Clients</span>
              <h2 className="text-4xl font-black text-slate-950 tracking-tight mb-4">150</h2>
              <button onClick={() => navigate('/crm/onboarding')} className="text-xs font-black underline text-slate-950 hover:opacity-80">
                View entire list &rarr;
              </button>
            </div>

            {/* 3D Superhero / Advisor Graphic */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full shadow-2xl border-4 border-white flex items-center justify-center animate-pulse">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── MIDDLE ROW: SALES MOTION WAVE CHART + DARK CALENDAR + RIGHT PANEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Sales Animated Wave Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#1c1d24] border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-white tracking-tight">Sales</h3>
            
            <div className="flex items-center gap-3">
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-[#262832] text-xs font-extrabold text-slate-200 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>

              <button className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>

          {/* SVG Motion Line Chart Container */}
          <div className="relative h-64 w-full my-4">
            
            {/* Grid Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[11px] font-bold text-slate-500 pointer-events-none">
              <span>$50k</span>
              <span>$40k</span>
              <span>$30k</span>
              <span>$20k</span>
              <span>$10k</span>
            </div>

            {/* SVG Animated Curves */}
            <div className="ml-10 h-full w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                
                {/* Background Grid Lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#2a2c38" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#2a2c38" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#2a2c38" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="#2a2c38" strokeDasharray="4 4" />

                {/* Dotted Emerald Line */}
                <path
                  d="M0,150 Q75,180 150,110 T300,100 T450,140"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                />

                {/* Vibrant Purple Primary Curve */}
                <path
                  d="M0,130 C50,90 100,160 150,80 C200,40 250,120 300,30 C350,70 400,60 450,100"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Floating Tooltip Badge ($10k) */}
                <g transform="translate(300, 30)">
                  <circle r="6" fill="#a855f7" stroke="#ffffff" strokeWidth="2" className="animate-ping" />
                  <rect x="-24" y="-32" width="48" height="22" rx="6" fill="#ffffff" />
                  <text x="0" y="-18" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="900">$10k</text>
                </g>

              </svg>

              {/* 3D Advisor Pointer Graphic (Matching User Screenshot) */}
              <div className="absolute right-12 top-6 flex items-center gap-2 bg-slate-900/90 border border-purple-500/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-white block">AUM Advisory</span>
                  <span className="text-[10px] font-bold text-emerald-400">+28.4% Growth</span>
                </div>
              </div>
            </div>

          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-800 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-purple-500 rounded-full" /> Securities & Wealth
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-emerald-400 rounded-full border-dashed" /> Annuities & IUL
            </div>
          </div>

        </div>

        {/* Dark Motion Calendar Widget (1 Col) */}
        <div className="bg-[#1c1d24] border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white">Calendar</h3>
            <span className="text-xs font-bold text-slate-400 cursor-pointer hover:text-white" onClick={() => navigate('/crm/calendar')}>View</span>
          </div>

          {/* Date Selector Header */}
          <div className="bg-[#262832] p-3 rounded-2xl border border-slate-700 flex items-center justify-between mb-6">
            <span className="text-xs font-extrabold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" /> {selectedMonth}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <span key={d} className="text-slate-500 text-[10px] py-1">{d}</span>
            ))}
            
            {[27, 28, 29, 30, 31, 1, 2].map(n => <span key={n} className="text-slate-600 py-1.5">{n}</span>)}
            {[3, 4, 5, 6, 7, 8, 9].map(n => (
              <span key={n} className={`py-1.5 rounded-xl cursor-pointer transition-all ${
                [3, 4, 5, 6, 7].includes(n) ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-200 hover:bg-slate-800'
              }`}>{n}</span>
            ))}
            {[10, 11, 12, 13, 14, 15, 16].map(n => <span key={n} className="text-slate-300 py-1.5">{n}</span>)}
            {[17, 18, 19, 20, 21, 22, 23].map(n => <span key={n} className="text-slate-300 py-1.5">{n}</span>)}
            {[24, 25, 26, 27, 28, 29, 30].map(n => <span key={n} className="text-slate-300 py-1.5">{n}</span>)}
          </div>

          <div className="p-4 bg-[#262832] rounded-2xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">4 Advisory Appointments</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW: 3D PILL BAR CHART + RIGHT PANEL DONUT + CUSTOMER DETAILS TABLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bottom Left: Weekly Sales 3D Pill Bar Chart & Customer Details Table */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Weekly Sales 3D Pill Bar Chart */}
          <div className="bg-[#1c1d24] border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6">Weekly Sales</h3>

            {/* 3D Pill Bars */}
            <div className="flex items-end justify-between h-48 px-6 pt-6">
              {[
                { day: 'Mon', height: '60%', color: 'from-orange-500 to-amber-400' },
                { day: 'Tue', height: '40%', color: 'from-pink-500 to-rose-400' },
                { day: 'Wed', height: '55%', color: 'from-yellow-400 to-amber-300' },
                { day: 'Thu', height: '85%', color: 'from-emerald-400 to-teal-300', badge: '$10k' },
                { day: 'Fri', height: '90%', color: 'from-orange-500 to-red-400' },
                { day: 'Sat', height: '65%', color: 'from-slate-400 to-slate-200' }
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end group">
                  {bar.badge && (
                    <span className="px-2.5 py-1 bg-white text-slate-950 font-black text-[10px] rounded-lg shadow-lg mb-1 animate-bounce">
                      {bar.badge}
                    </span>
                  )}
                  <div 
                    style={{ height: bar.height }} 
                    className={`w-7 rounded-full bg-gradient-to-t ${bar.color} shadow-lg transition-all duration-500 group-hover:scale-110`}
                  />
                  <span className="text-xs font-extrabold text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details Table */}
          <div className="bg-[#1c1d24] border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">Customer Details</h3>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-[#262832] text-xs font-bold text-slate-300 rounded-xl flex items-center gap-2 border border-slate-700">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
                <button className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 font-extrabold border-b border-slate-800 pb-3">
                    <th className="pb-3">Id</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Invoiced Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-bold">
                  <tr>
                    <td className="py-4 text-slate-400">RZ17308</td>
                    <td className="py-4 text-white">Jonathan Miller</td>
                    <td className="py-4 text-slate-400">13/01/2026</td>
                    <td className="py-4 text-white">$ 54 000</td>
                    <td className="py-4 text-amber-400">Shipped</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-slate-400">RZ8308</td>
                    <td className="py-4 text-white">Eleanor Vance</td>
                    <td className="py-4 text-slate-400">13/01/2026</td>
                    <td className="py-4 text-white">$ 86 050</td>
                    <td className="py-4 text-emerald-400">Delivered</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-slate-400">RZ8765</td>
                    <td className="py-4 text-white">Robert Sterling</td>
                    <td className="py-4 text-slate-400">13/01/2026</td>
                    <td className="py-4 text-white">$ 4 000</td>
                    <td className="py-4 text-blue-400">Paid</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Panel: Donut Pie Chart & Visitor Progress Bars */}
        <div className="bg-[#1c1d24] border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black text-slate-400">petshop.com (Oreo)</span>
              <span className="px-3 py-1 bg-[#262832] text-xs font-extrabold text-slate-200 rounded-xl border border-slate-700">
                05th -12th Jan
              </span>
            </div>

            {/* Donut Chart Graphics */}
            <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#f43f5e" strokeWidth="16" fill="none" strokeDasharray="60 100" />
                <circle cx="50" cy="50" r="38" stroke="#22d3ee" strokeWidth="16" fill="none" strokeDasharray="40 100" strokeDashoffset="-60" />
                <circle cx="50" cy="50" r="38" stroke="#a855f7" strokeWidth="16" fill="none" strokeDasharray="50 100" strokeDashoffset="-100" />
                <circle cx="50" cy="50" r="38" stroke="#4ade80" strokeWidth="16" fill="none" strokeDasharray="30 100" strokeDashoffset="-150" />
              </svg>

              <div className="absolute top-2 right-4 px-2 py-1 bg-white text-slate-950 font-black text-[10px] rounded-md shadow-md animate-pulse">
                $10k
              </div>
            </div>

            {/* Channel Legends */}
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-300 mb-8">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-500 rounded-sm" /> Facebook</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-cyan-400 rounded-sm" /> Youtube</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-sm" /> Instagram</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-400 rounded-sm" /> Website</div>
            </div>

            {/* Stats Roster */}
            <div className="space-y-3 pt-6 border-t border-slate-800 text-xs font-bold">
              <div className="flex justify-between"><span className="text-slate-400">Total Intake</span> <span className="text-white">1500k</span></div>
              <div className="flex justify-between"><span className="text-slate-400">New Customers</span> <span className="text-emerald-400">7k <span className="text-[10px]">+1k</span></span></div>
              <div className="flex justify-between"><span className="text-slate-400">Repeat Customers</span> <span className="text-white">1.5k</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Revenue</span> <span className="text-white">130k</span></div>
            </div>
          </div>

          {/* Visitor Progress Bars */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">Online Visitors</span>
                <span className="text-white font-black">20k</span>
              </div>
              <div className="w-full h-2 bg-[#262832] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">Offline Visitors</span>
                <span className="text-white font-black">7k</span>
              </div>
              <div className="w-full h-2 bg-[#262832] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full w-[45%]" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
