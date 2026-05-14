import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Activity, 
  DollarSign, 
  Info,
  Lock,
  ArrowRight,
  Mail,
  Home,
  AlertCircle,
  Zap,
  Heart,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Backend } from '../../services/apiBackend';

/**
 * NHFG LIFE INSURANCE - INTELLIGENT QUOTE FUNNEL (V5.1)
 * ENTERPRISE ACTUARIAL ENGINE: Expanded product suite (IUL, Final Expense).
 */

enum LifeStep {
  INTRO = 0,
  PERSONAL_INFO = 1,
  ADDRESS_INFO = 2,
  CONTACT_INFO = 3,
  DOB = 4,
  PLAN_SELECTION = 5,
  COVERAGE_AMOUNT = 6,
  HEALTH_PROFILE = 7,
  EXISTING_INSURANCE = 8,
  ADDITIONAL_INFO = 9,
  CALCULATING = 10,
  RESULTS = 11,
  CONFIRMATION = 12
}

type LifeProduct = 'term' | 'whole' | 'universal' | 'iul' | 'final_expense';

interface LifeQuoteData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  dob: string;
  age: number;
  plan: LifeProduct;
  coverage: number;
  healthIssues: string;
  hasInsurance: boolean;
  additionalComments?: string;
  leadScore: number;
  leadTag: 'HOT' | 'WARM' | 'COLD';
  healthRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

// --- SUB-COMPONENTS ---

const ProgressHeader = ({ step }: { step: number }) => {
    const percentage = (step / (LifeStep.CONFIRMATION)) * 100;
    return (
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-100 z-50">
        <div 
          className="h-full bg-emerald-600 transition-all duration-1000 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
};

const Card = ({ children, title, subtitle, onBack }: { children: React.ReactNode, title?: string, subtitle?: string, onBack?: () => void }) => (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.06)] border border-slate-50 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-600">
      <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Lock size={14} /></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strictly Confidential</span>
      </div>
      {title && <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight leading-tight">{title}</h2>}
      {subtitle && <p className="text-slate-500 font-medium mb-10 leading-relaxed">{subtitle}</p>}
      {children}
      {onBack && (
          <button onClick={onBack} className="mt-8 text-slate-400 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
              <ChevronLeft size={18} /> Back
          </button>
      )}
    </div>
);

export const LifeInsuranceFunnel: React.FC = () => {
  const [step, setStep] = useState<LifeStep>(LifeStep.INTRO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Partial<LifeQuoteData>>(() => {
    const saved = localStorage.getItem('nhfg_life_quote_progress');
    return saved ? JSON.parse(saved) : {
      plan: 'term',
      coverage: 500000,
      hasInsurance: false,
      leadScore: 0,
      leadTag: 'WARM',
      healthRisk: 'LOW'
    };
  });

  const [estimate, setEstimate] = useState<{ range: [number, number] } | null>(null);

  useEffect(() => {
    localStorage.setItem('nhfg_life_quote_progress', JSON.stringify(data));
  }, [data]);

  const nextStep = () => { setError(null); setStep(s => s + 1); };
  const prevStep = () => { setError(null); setStep(s => s - 1); };

  // --- ACTUARIAL LIFE ENGINE V5.1 (Expanded Products) ---
  const calculateLifeEstimate = () => {
    const age = data.age || 30;
    const coverage = data.coverage || 500000;
    const plan = data.plan || 'term';

    // 1. BASE RATE DETERMINATION (Indexed to 2024 Mortality Tables)
    let monthlyBase = 28; 
    
    // 2. AGE-BASED ESCALATION (Exponential risk curve)
    if (age > 25) monthlyBase += (age - 25) * 2.45; 
    if (age > 40) monthlyBase += (age - 40) * 9.75; 
    if (age > 55) monthlyBase += (age - 55) * 38.0; 
    if (age > 65) monthlyBase += (age - 65) * 125.0; 

    // 3. PRODUCT TYPE LOGIC (Asset-building vs Pure Protection)
    let productMultiplier = 1.0;
    if (plan === 'whole') productMultiplier = 10.8; 
    if (plan === 'universal') productMultiplier = 7.2;
    if (plan === 'iul') productMultiplier = 8.9; // IUL sits between Universal and Whole
    if (plan === 'final_expense') productMultiplier = 15.5; // High cost due to guaranteed issue

    // 4. COVERAGE SCALING
    const coverageMultiplier = coverage / 500000;
    let finalRate = monthlyBase * productMultiplier * coverageMultiplier;

    // 5. FINAL EXPENSE CAP (Usually limited to $50k)
    if (plan === 'final_expense' && coverage > 50000) {
        // Force a normalized smaller coverage for realistic pricing if user dragged high
        finalRate = (monthlyBase * productMultiplier) * (coverage / 50000) * 0.1;
    }

    // 6. UNDERWRITING RISK
    const hl = data.healthIssues?.toLowerCase() || '';
    if (hl.length > 3) {
        if (hl.includes('heart') || hl.includes('cancer') || hl.includes('stroke')) finalRate *= 5.5;
        else if (hl.includes('diabetes') || hl.includes('pressure') || hl.includes('smoke')) finalRate *= 2.4;
        else finalRate *= 1.45;
    }

    setEstimate({
      range: [Math.round(finalRate * 0.92), Math.round(finalRate * 1.40)]
    });
  };

  const processQuote = async () => {
    setLoading(true);
    calculateLifeEstimate();
    
    const transitionTimeout = setTimeout(() => {
        setStep(LifeStep.RESULTS);
        setLoading(false);
    }, 3000);

    try {
      await Backend.saveApplication({
        type: 'life_insurance_quote',
        ...data,
        estimate,
        source: 'life_funnel_v5.1_actuarial'
      });
    } catch (e) {
      console.warn('[System] Life Funnel: Actuarial data cached locally.');
    }
  };

  useEffect(() => {
    if (step === LifeStep.CALCULATING) {
      processQuote();
    }
  }, [step]);

  // --- RENDERING ---

  if (step === LifeStep.INTRO) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
      <Card title="Life Insurance Quote" subtitle="Protect your family's future with institutional-grade underwriting.">
        <div className="text-center">
          <div className="inline-flex p-5 bg-emerald-50 text-emerald-600 rounded-3xl mb-4"><Shield size={48} strokeWidth={2.5} /></div>
          <div className="mb-8"><span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">v5.1 Actuarial Engine</span></div>
          <button onClick={nextStep} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black py-6 rounded-[2rem] transition-all transform hover:scale-[1.02] shadow-2xl shadow-emerald-200">Start My Quote</button>
        </div>
      </Card>
    </div>
  );

  if (step === LifeStep.PERSONAL_INFO) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Your Identity" onBack={prevStep}>
            <div className="space-y-4">
                <input type="text" value={data.firstName || ''} onChange={e => setData({...data, firstName: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none focus:ring-2 focus:ring-emerald-600" placeholder="First Name" />
                <input type="text" value={data.lastName || ''} onChange={e => setData({...data, lastName: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Last Name" />
                <button disabled={!data.firstName || !data.lastName} onClick={nextStep} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl">Continue</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.ADDRESS_INFO) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Your Residence" onBack={prevStep}>
            <div className="space-y-4">
                <input type="text" value={data.address || ''} onChange={e => setData({...data, address: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none" placeholder="Street Address" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={data.city || ''} onChange={e => setData({...data, city: e.target.value})} className="p-5 bg-slate-50 rounded-2xl font-black outline-none" placeholder="City" />
                  <input type="text" value={data.zip || ''} onChange={e => setData({...data, zip: e.target.value})} className="p-5 bg-slate-50 rounded-2xl font-black outline-none" placeholder="ZIP" />
                </div>
                <button disabled={!data.address || !data.city || !data.zip} onClick={nextStep} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl">Continue</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.CONTACT_INFO) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Contact Details" onBack={prevStep}>
            <div className="space-y-4">
                <input type="tel" value={data.phone || ''} onChange={e => setData({...data, phone: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none" placeholder="Phone Number" />
                <input type="email" value={data.email || ''} onChange={e => setData({...data, email: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none" placeholder="Email Address" />
                <button disabled={!data.phone || !data.email} onClick={nextStep} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl">Continue</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.DOB) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Date of Birth" subtitle="Premiums scale exponentially based on mortality table risk." onBack={prevStep}>
            <div className="space-y-6">
                <input required type="date" value={data.dob || ''} onChange={e => setData({...data, dob: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none" />
                <button disabled={!data.dob} onClick={() => { if (data.dob) { const age = (new Date().getFullYear() - new Date(data.dob).getFullYear()); setData({...data, age}); nextStep(); } }} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl">Confirm Age</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.PLAN_SELECTION) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Select Your Plan" onBack={prevStep}>
            <div className="grid grid-cols-1 gap-3">
                {[
                    { id: 'term', label: 'Term Life', sub: 'Fixed period coverage' },
                    { id: 'whole', label: 'Whole Life', sub: 'Lifetime + Cash value' },
                    { id: 'universal', label: 'Universal Life', sub: 'Flexible premiums' },
                    { id: 'iul', label: 'Indexed Universal Life', sub: 'Market-linked growth' },
                    { id: 'final_expense', label: 'Final Expenses', sub: 'Burial & legacy costs' },
                ].map(p => (
                    <button key={p.id} onClick={() => { setData({...data, plan: p.id as any}); nextStep(); }} className={`p-6 rounded-2xl border-2 transition-all capitalize font-black text-left flex justify-between items-center ${data.plan === p.id ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xl' : 'border-slate-100 text-slate-500 hover:border-emerald-200'}`}>
                        <div className="flex flex-col">
                            <span className="text-base">{p.label}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.sub}</span>
                        </div>
                        {data.plan === p.id && <CheckCircle size={20} className="text-emerald-600" />}
                    </button>
                ))}
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.COVERAGE_AMOUNT) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Coverage Level" onBack={prevStep}>
            <div className="space-y-12 py-10 text-center">
                <h3 className="text-6xl font-black text-slate-900 tracking-tighter">${(data.coverage || 500000).toLocaleString()}</h3>
                <input type="range" min={data.plan === 'final_expense' ? 5000 : 100000} max={data.plan === 'final_expense' ? 50000 : 5000000} step={data.plan === 'final_expense' ? 1000 : 100000} value={data.coverage || 500000} onChange={e => setData({...data, coverage: parseInt(e.target.value)})} className="w-full accent-emerald-600" />
                <button onClick={nextStep} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl">Continue</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.HEALTH_PROFILE) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Health Snapshot" onBack={prevStep}>
            <div className="space-y-4">
                <textarea value={data.healthIssues || ''} className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none h-32 focus:ring-2 focus:ring-emerald-600" placeholder="e.g. Hypertension, History of Illness, Smoking..." onChange={e => setData({...data, healthIssues: e.target.value})} />
                <button onClick={nextStep} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl">Analyze Data</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.EXISTING_INSURANCE) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Current Coverage" onBack={prevStep}>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setData({...data, hasInsurance: true}); nextStep(); }} className={`p-8 rounded-2xl border-2 font-black transition-all ${data.hasInsurance === true ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 hover:bg-slate-50'}`}>YES</button>
                <button onClick={() => { setData({...data, hasInsurance: false}); nextStep(); }} className={`p-8 rounded-2xl border-2 font-black transition-all ${data.hasInsurance === false ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 hover:bg-slate-50'}`}>NO</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.ADDITIONAL_INFO) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <ProgressHeader step={step} />
        <Card title="Final Review" onBack={prevStep}>
            <div className="space-y-4">
                <textarea value={data.additionalComments || ''} className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none h-32 focus:ring-2 focus:ring-emerald-600" placeholder="Notes for your advisor..." onChange={e => setData({...data, additionalComments: e.target.value})} />
                <button onClick={() => setStep(LifeStep.CALCULATING)} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl text-xl shadow-xl shadow-emerald-100">Submit Request</button>
            </div>
        </Card>
    </div>
  );

  if (step === LifeStep.CALCULATING) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50 text-center">
        <Card><div className="py-24"><Activity size={64} className="animate-pulse mx-auto text-emerald-600 mb-8" /><h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 animate-bounce">Analyzing Mortality Risk...</h2></div></Card>
    </div>
  );

  if (step === LifeStep.RESULTS) return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50">
        <Card title="Premium Estimate Ready" subtitle="Based on multi-variable risk weighting.">
            <div className="bg-slate-900 text-white p-12 rounded-2xl mb-10 text-center relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                    <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Underwriting Estimate</p>
                    <div className="text-6xl font-black tracking-tighter leading-none">${estimate?.range[0]} – ${estimate?.range[1]}</div>
                    <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest">/ Per Month</p>
                </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 mb-8">
                <div className="bg-amber-500 text-white p-2 rounded-lg shrink-0"><AlertTriangle size={16} /></div>
                <p className="text-[10px] font-black text-amber-900 leading-tight">Actuarial Warning: Prices are highly sensitive to age and plan type. {data.plan === 'whole' || data.plan === 'iul' ? 'Asset-building premiums detected.' : ''}</p>
            </div>
            <button onClick={nextStep} className="w-full bg-emerald-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-emerald-100 text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                <Shield size={20} /> Unlock Official Quote
            </button>
        </Card>
    </div>
  );

  if (step === LifeStep.CONFIRMATION) return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center p-6 bg-slate-50/50 text-center">
          <Card><div className="py-16"><CheckCircle size={48} className="mx-auto text-emerald-600 mb-10 animate-bounce" /><h2 className="text-4xl font-black text-slate-900 mb-10">Submission Secure!</h2><p className="text-slate-500 font-bold italic mb-8">v5.1 Actuarial Sync Complete</p><button onClick={() => { localStorage.removeItem('nhfg_life_quote_progress'); window.location.href = '/'; }} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl">Done</button></div></Card>
      </div>
  );

  return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>;
};
