import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  TrendingUp, ArrowUpRight, ShieldCheck, ArrowRight, Zap,
  RefreshCw, Phone, CheckCircle2, Radio, Sparkles,
  Building2, Landmark, Truck, Plus, Trash2
} from 'lucide-react';
import { TaskPriority } from '../../types';
import { Tab3DBanner } from '../../components/shared/Tab3DBanner';
import { CRMAnalyticsCharts } from '../../components/analytics/CRMAnalyticsCharts';

interface LiveEvent {
  id: string;
  type: 'signalwire_call' | 'signalwire_ai' | 'plaid_verify' | 'job_application' | 'marketing_payment' | 'policy_app';
  title: string;
  subtitle: string;
  timestamp: string;
  badge?: string;
  color: string;
}

export const Dashboard: React.FC = () => {
  const { user, tasks, addTask, toggleTask, deleteTask } = useData();
  const navigate = useNavigate();

  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    {
      id: 'evt-1',
      type: 'signalwire_ai',
      title: 'SignalWire AI Lead Qualification Complete',
      subtitle: 'Jonathan Miller ($250k liquid capital) rated Warm 🔥',
      timestamp: '2 mins ago',
      badge: 'Warm',
      color: 'bg-rose-500/10 text-rose-600 border-rose-200'
    },
    {
      id: 'evt-2',
      type: 'plaid_verify',
      title: 'Plaid 1-Click Bank ACH Verification',
      subtitle: 'Chase Bank checking account ending in ...4910 verified for $120,000 ACH draft',
      timestamp: '14 mins ago',
      badge: 'Verified',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    },
    {
      id: 'evt-3',
      type: 'job_application',
      title: 'New Advisor Application Submitted',
      subtitle: 'David Vance submitted Series 7 & 66 License details via /join',
      timestamp: '42 mins ago',
      badge: 'Pending Review',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      id: 'evt-4',
      type: 'marketing_payment',
      title: 'Stripe Campaign Funding Approved',
      subtitle: 'Q3 Wealth Growth Campaign funded for $15,000 via Stripe PaymentIntent',
      timestamp: '1 hour ago',
      badge: 'Approved',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');


  // Poll SignalWire & Recent API Events
  const fetchRecentActivity = async () => {
    try {
      const callsRes = await fetch('/api/signalwire/calls');

      if (callsRes.ok) {
        const calls = await callsRes.json();
        if (calls.length > 0) {
          const latestCall = calls[0];
          setLiveEvents(prev => [
            {
              id: 'call-' + latestCall.id,
              type: 'signalwire_call',
              title: `SignalWire ${latestCall.direction === 'ai_qualification' ? 'AI Call' : 'Outbound Call'} (${latestCall.lead_name})`,
              subtitle: latestCall.ai_qualification_summary || latestCall.transcript?.slice(0, 80),
              timestamp: 'Just now',
              badge: latestCall.ai_rating || 'Completed',
              color: latestCall.ai_rating === 'Warm' ? 'bg-rose-500/10 text-rose-600 border-rose-200' : 'bg-blue-500/10 text-blue-600 border-blue-200'
            },
            ...prev.slice(0, 5)
          ]);
        }
      }
    } catch (err) {
      console.error('[Dashboard Feed Error]:', err);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        priority: TaskPriority.MEDIUM,
        completed: false,
        advisorId: user?.id || '1'
      });
      setNewTaskTitle('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900 pb-20 selection:bg-blue-500/20">
      
      {/* ── APPLE MAC-STYLE WELCOME HEADER ── */}
      <div className="relative overflow-hidden apple-glass rounded-[2.5rem] p-8 md:p-12 mb-10 border border-white/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-extrabold uppercase tracking-widest mb-4 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" /> New Holland Command Center v4.2
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name || 'Advisor'}</span>.
            </h1>
            <p className="text-base text-slate-500 font-medium max-w-xl leading-relaxed">
              Your real-time enterprise overview across Wealth, Insurance, Real Estate, Mortgages, Logistics, and SignalWire AI Telephony.
            </p>
          </div>

          {/* Quick Action Floating Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/crm/telephony')}
              className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all apple-card"
            >
              <Phone className="w-4 h-4" /> SignalWire Telephony
            </button>

            <button
              onClick={() => navigate('/crm/bank-verification')}
              className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all apple-card"
            >
              <Landmark className="w-4 h-4" /> Plaid ACH Verify
            </button>

            <button
              onClick={() => navigate('/crm/campaigns')}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all apple-card"
            >
              <Zap className="w-4 h-4" /> Marketing Pro
            </button>
          </div>
        </div>
      </div>

      {/* ── 3D VIBRANT ANIMATED BANNER CARDS ── */}
      <Tab3DBanner
        cards={[
          ...(user?.category === 'SECURITIES' || user?.role === 'ADMIN' ? [{ title: "Weekly Portfolio Balance", value: "$142.8M", subtitle: "Managed Wealth Assets", emoji: "💰", gradient: "cyan", linkPath: "/crm/securities", linkText: "View entire list" }] : []),
          ...(user?.category === 'REAL_ESTATE' ? [{ title: "Active Escrow Deals", value: "18", subtitle: "Total Value: $18.4M", emoji: "🏢", gradient: "cyan", linkPath: "/crm/properties", linkText: "View entire list" }] : []),
          ...(user?.category === 'LOGISTICS' ? [{ title: "Active Dispatches", value: "42", subtitle: "Total Loads: 128", emoji: "🚛", gradient: "cyan", linkPath: "/crm/logistics", linkText: "View entire list" }] : []),
          { title: "Applications In Line", value: "750", subtitle: "Active Processing Queue", emoji: "📱", gradient: "yellow", linkPath: "/crm/leads", linkText: "View entire list" },
          { title: "New Clients Onboarded", value: "150", subtitle: "Q3 New Accounts", emoji: "🦸‍♀️", gradient: "pink", linkPath: "/crm/clients", linkText: "View entire list" }
        ].slice(0, 3)}
      />

      {/* ── ANIMATED ANALYTICS CHARTS & NEON GLOW DASHBOARD ── */}
      <CRMAnalyticsCharts />

      {/* ── LIVE REAL-TIME CRM EVENT STREAM ("WHAT'S HAPPENING NOW") ── */}
      <div className="apple-glass rounded-[2.5rem] p-8 mb-10 border border-white/80 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Live CRM Event Feed</h2>
              <p className="text-xs text-slate-400 font-medium">Real-time stream of SignalWire calls, Plaid verifications, applications, and payments</p>
            </div>
          </div>

          <button 
            onClick={fetchRecentActivity}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Live Sync
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveEvents.map(evt => (
            <div key={evt.id} className="apple-glass p-5 rounded-3xl border border-white/60 apple-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${evt.color}`}>
                    {evt.badge || 'Live Event'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">{evt.timestamp}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">{evt.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{evt.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCT SUITE VERTICAL HUBS (APPLE CARDS) ── */}
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 px-2">Enterprise Product Vertical Hubs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        
        {/* 1. Wealth & Securities */}
        {(user?.category === 'SECURITIES' || user?.productsSold?.includes('securities') || user?.role === 'ADMIN') && (
        <div 
          onClick={() => navigate('/crm/portfolio')}
          className="apple-glass p-8 rounded-[2.5rem] border border-white/80 shadow-xl apple-card cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-extrabold text-xs rounded-full border border-emerald-500/20">
                +14.2% YoY
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Securities & Advisory</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">$142.8M</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Total Assets Under Management (AUM) across private wealth, annuities, and fee-based portfolios.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Portfolio Mgmt & Advisory Billing</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        )}

        {/* 2. Real Estate & Escrow */}
        {(user?.category === 'REAL_ESTATE' || user?.productsSold?.includes('real_estate') || user?.role === 'ADMIN') && (
        <div 
          onClick={() => navigate('/crm/properties')}
          className="apple-glass p-8 rounded-[2.5rem] border border-white/80 shadow-xl apple-card cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 font-extrabold text-xs rounded-full border border-blue-500/20">
                18 Active Deals
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Real Estate & Escrow</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">$18.4M</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Active escrow pipeline, commercial real estate listings, and market intelligence tracking.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Open Property Pipeline</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        )}

        {/* 3. Life & Commercial Insurance */}
        {(user?.category === 'INSURANCE' || user?.productsSold?.includes('life') || user?.role === 'ADMIN') && (
        <div 
          onClick={() => navigate('/crm/applications')}
          className="apple-glass p-8 rounded-[2.5rem] border border-white/80 shadow-xl apple-card cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-rose-500/10 text-rose-600 rounded-2xl">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-600 font-extrabold text-xs rounded-full border border-rose-500/20">
                98.2% Approval
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Insurance & Protection</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">$840K/mo</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Life, auto, commercial, and group benefits policy applications and carrier renewals.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>Policies & Carrier Portal</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        )}

        {/* 4. Mortgage & Lending */}
        {(user?.category === 'MORTGAGE' || user?.productsSold?.includes('mortgage') || user?.role === 'ADMIN') && (
        <div 
          onClick={() => navigate('/crm/loans')}
          className="apple-glass p-8 rounded-[2.5rem] border border-white/80 shadow-xl apple-card cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                <Landmark className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-extrabold text-xs rounded-full border border-emerald-500/20">
                Plaid Enabled
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Mortgage & Lending</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">$6.2M</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Loan originations, rate calculators, and 1-click Plaid instant bank verifications.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>Loan Applications & Rates</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        )}

        {/* 5. Logistics & Fleet */}
        {(user?.category === 'LOGISTICS' || user?.productsSold?.includes('logistics') || user?.role === 'ADMIN') && (
        <div 
          onClick={() => navigate('/crm/logistics')}
          className="apple-glass p-8 rounded-[2.5rem] border border-white/80 shadow-xl apple-card cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl">
                <Truck className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 font-extrabold text-xs rounded-full border border-indigo-500/20">
                42 Dispatched
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Logistics & Fleet</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">128 Loads</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Commercial load posting terminal, carrier verification, and fleet operations.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Logistics Command Center</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        )}

        {/* 6. SignalWire Telephony & AI */}
        <div 
          onClick={() => navigate('/crm/telephony')}
          className="apple-glass p-8 rounded-[2.5rem] border border-white/80 shadow-xl apple-card cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-purple-500/10 text-purple-600 rounded-2xl">
                <Radio className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-600 font-extrabold text-xs rounded-full border border-purple-500/20">
                AI Agent Active
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">SignalWire Telephony</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">94 Calls</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Corporate softphone, advisor extensions (IVR), 2-way SMS, and AI Lead Qualification.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Open Telephony Suite</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* ── STRATEGIC PRIORITIES & TASK MANAGER (APPLE MAC STYLE) ── */}
      <div className="apple-glass rounded-[2.5rem] p-8 border border-white/80 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Strategic Priorities & Advisor Tasks</h3>
            <p className="text-xs text-slate-400 font-medium">Reorder, mark complete, or add new priority action items</p>
          </div>

          <form onSubmit={handleAddTask} className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Add strategic priority..."
              className="bg-white/80 border border-slate-200 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              className={`apple-glass p-4 rounded-2xl border border-white/60 flex items-center justify-between gap-4 transition-all ${
                task.completed ? 'opacity-50 line-through' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <span className="text-sm font-semibold text-slate-800">{task.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-200">
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
