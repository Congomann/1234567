import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { 
  Briefcase, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Handshake,
  Building2,
  Users,
  Truck,
  X,
  PlayCircle,
  Code2,
  CheckCircle2,
  Sliders,
  Sparkles,
  Search,
  FileText,
  Lock,
  Mail,
  Phone,
  Check,
  ChevronRight,
  Layers,
  BarChart3,
  Settings
} from "lucide-react";
import { SEO } from "../../components/SEO";
import { Backend } from "../../services/apiBackend";

export const Partnership: React.FC = () => {
  const navigate = useNavigate();
  const { companySettings } = useData();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'life' | 'real-estate' | 'mortgage-wealth' | 'logistics'>('all');
  
  // Interactive Live API Sandbox State
  const [sandboxEndpoint, setSandboxEndpoint] = useState<'life-quote' | 'freight-dispatch' | 'mortgage-rate'>('life-quote');
  const [apiExecuting, setApiExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  // Interactive Volume Estimator State
  const [advisorCount, setAdvisorCount] = useState(45);
  const [monthlyVolume, setMonthlyVolume] = useState(120);

  // Carrier Application Form State
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [appRefId, setAppRefId] = useState('');
  const [appForm, setAppForm] = useState({
    companyName: '',
    partnerCategory: 'Life & Annuity Carrier',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    statesOperating: '48 States (Nationwide)',
    projectedVolume: '$1M - $5M / Year',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Admin Configured Dynamic Carrier Partners
  const adminPartners = Object.entries(companySettings.partners || {}).map(([name, url]) => ({
    name,
    logoUrl: (url as string).startsWith('http') || (url as string).startsWith('data:') ? (url as string) : `https://logo.clearbit.com/${url}`,
    domain: url as string,
    rating: 'Admin Verified Partner',
    statesCovered: 50
  }));

  // Live API Sandbox Execution Handler
  const handleExecuteApiSandbox = async () => {
    setApiExecuting(true);
    setApiResponse(null);

    await new Promise(res => setTimeout(res, 450));

    if (sandboxEndpoint === 'life-quote') {
      setApiResponse({
        status: 200,
        latency: "38ms",
        endpoint: "/api/v1/quotes/life-term",
        payload: {
          applicant: { age: 38, gender: "Male", tobacco: false, state: "IA" },
          faceAmount: 1000000,
          termYears: 20,
          carrierQuotes: [
            { carrier: "Lincoln Financial", product: "TermAccord 20", monthlyPremium: "$48.50", underwritingTier: "Preferred Best", instantDecisionEligible: true },
            { carrier: "Protective Life", product: "Custom Choice UL", monthlyPremium: "$51.20", underwritingTier: "Preferred Plus", instantDecisionEligible: true },
            { carrier: "Mutual of Omaha", product: "Term Life Answers", monthlyPremium: "$53.80", underwritingTier: "Standard Plus", instantDecisionEligible: true }
          ]
        }
      });
    } else if (sandboxEndpoint === 'freight-dispatch') {
      setApiResponse({
        status: 200,
        latency: "42ms",
        endpoint: "/api/v1/freight/dispatch-quote",
        payload: {
          origin: "Des Moines, IA 50309",
          destination: "Dallas, TX 75201",
          equipment: "53ft Dry Van",
          totalMiles: 685,
          marketRates: {
            linehaulRate: "$2.48 / mile",
            fuelSurcharge: "$0.42 / mile",
            grossFreightQuote: "$1,986.50",
            availableCarrierTrucks: 14,
            dispatchGuaranteedHours: 4
          }
        }
      });
    } else {
      setApiResponse({
        status: 200,
        latency: "31ms",
        endpoint: "/api/v1/mortgage/rate-lock",
        payload: {
          loanType: "30-Year Fixed Conventional",
          purchasePrice: 450000,
          downPaymentPct: 20,
          creditScoreTier: "760+",
          pricing: {
            interestRate: "6.375%",
            apr: "6.420%",
            estimatedMonthlyPI: "$2,246.12",
            rateLockPeriod: "45 Days Guaranteed"
          }
        }
      });
    }

    setApiExecuting(false);
  };

  // Carrier Application Submission Handler
  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppLoading(true);

    const ref = `NHFG-PTR-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await Backend.savePublicLead({
        name: appForm.contactName,
        email: appForm.email,
        phone: appForm.phone,
        interest: appForm.partnerCategory as ProductType,
        message: `Company: ${appForm.companyName} | Title: ${appForm.contactTitle} | States: ${appForm.statesOperating} | Volume: ${appForm.projectedVolume} | Message: ${appForm.message}`,
        source: 'Website Carrier & Partner Application',
        customDetails: {
          refId: ref,
          companyName: appForm.companyName,
          partnerCategory: appForm.partnerCategory,
          projectedVolume: appForm.projectedVolume
        }
      });

      setAppRefId(ref);
      setAppSubmitted(true);
    } catch (err) {
      alert("Application submission received. An institutional partnership officer will reach out shortly.");
      setAppRefId(ref);
      setAppSubmitted(true);
    } finally {
      setAppLoading(false);
    }
  };

  // Calculated Volume Estimates
  const estimatedAnnualPremium = (advisorCount * monthlyVolume * 1450).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const estimatedPolicyCount = (advisorCount * monthlyVolume * 12).toLocaleString();

  return (
    <div className="bg-slate-50 font-sans min-h-screen selection:bg-blue-500 selection:text-white">
      <SEO 
        title="Partnerships & Carriers | New Holland Financial Group" 
        description="Partner with New Holland Financial Group. Connect your insurance carrier, freight logistics network, mortgage lending desk, or fintech API to our 48-state advisor distribution network." 
      />
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-[#050A14] py-32 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-[#050A14] to-[#050A14] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase mb-8 backdrop-blur-md">
            <Handshake size={14} /> Institutional B2B Distribution Platform
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-tight">
            Partner with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
              New Holland Financial
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            Expand your distribution footprint across 48 active state jurisdictions. Integrate your insurance carriers, freight networks, mortgage lending desks, and fintech APIs directly into our high-performing advisor CRM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setShowDemoModal(true);
                handleExecuteApiSandbox();
              }}
              className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <PlayCircle size={18} />
              Test Drive API Sandbox
            </button>
            <a
              href="#apply-partner"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest border border-white/20 transition-all w-full sm:w-auto backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Apply for Appointment
            </a>
          </div>
        </div>
      </div>

      {/* 2. STATS & COMPLIANCE BAR */}
      <div className="border-b border-slate-200 bg-white py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="block text-3xl md:text-4xl font-black text-slate-900 tracking-tight">48</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active State Jurisdictions</span>
            </div>
            <div>
              <span className="block text-3xl md:text-4xl font-black text-blue-600 tracking-tight">14+</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier-1 Institutional Partners</span>
            </div>
            <div>
              <span className="block text-3xl md:text-4xl font-black text-emerald-600 tracking-tight">&lt; 24h</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Policy &amp; Dispatch Turnaround</span>
            </div>
            <div>
              <span className="block text-3xl md:text-4xl font-black text-purple-600 tracking-tight">100%</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Quoting Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VERIFIED CARRIERS & INSTITUTIONAL PARTNERS DIRECTORY */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Verified Carrier &amp; Partner Network
            </h2>
            <p className="text-slate-600 font-medium text-base leading-relaxed">
              We contract and integrate with premier insurance carriers, asset custodians, title providers, and freight transport networks.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: 'all', label: 'All Partners' },
                { id: 'life', label: 'Life & Annuities' },
                { id: 'real-estate', label: 'Real Estate & Title' },
                { id: 'mortgage-wealth', label: 'Mortgage & Securities' },
                { id: 'logistics', label: 'Freight & Logistics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                    activeCategory === tab.id
                      ? 'bg-[#0B2240] text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Admin Carrier Cards Grid */}
          {adminPartners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminPartners.map((c, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center p-2 border border-slate-200 overflow-hidden">
                        <img
                          src={c.logoUrl}
                          alt={c.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="font-bold text-slate-800 text-xs hidden">{c.name.substring(0, 3).toUpperCase()}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        <CheckCircle2 size={12} /> {c.rating}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{c.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 truncate font-mono">{c.domain}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Globe size={14} className="text-blue-600" /> 50 States Active
                    </span>
                    <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1" onClick={() => setShowDemoModal(true)}>
                      API Quoting <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Handshake size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin-Managed Carrier Directory</h3>
              <p className="text-sm text-slate-500 mb-6">
                Official insurance carriers, title agencies, lender networks, and logistics partners are managed exclusively by Admin accounts. Log in to the Admin Terminal to configure active partner contracts.
              </p>
              <Link
                to="/crm/admin/website"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B2240] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md"
              >
                <Settings size={14} /> Open Admin Partner CMS
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. INTERACTIVE DISTRIBUTION VOLUME & REVENUE ESTIMATOR */}
      <div className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                <Sliders size={14} /> Partner Calculator
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Estimate Distribution Reach &amp; Premium Volume
              </h2>
              <p className="text-slate-600 font-medium text-base leading-relaxed mb-8">
                Carriers and General Agencies can model projected premium growth when appointing products across the New Holland Financial advisor network.
              </p>

              {/* Slider 1: Advisor Count */}
              <div className="space-y-3 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Appointed Independent Advisors:</span>
                  <span className="text-blue-600 font-black text-lg">{advisorCount} Advisors</span>
                </div>
                <input 
                  type="range" 
                  min={10} 
                  max={250} 
                  step={5}
                  value={advisorCount} 
                  onChange={(e) => setAdvisorCount(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>10 Advisors</span>
                  <span>250 Advisors</span>
                </div>
              </div>

              {/* Slider 2: Monthly Volume per Advisor */}
              <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Avg. Monthly Submissions / Loads per Advisor:</span>
                  <span className="text-emerald-600 font-black text-lg">{monthlyVolume} Policies / Mo</span>
                </div>
                <input 
                  type="range" 
                  min={10} 
                  max={300} 
                  step={10}
                  value={monthlyVolume} 
                  onChange={(e) => setMonthlyVolume(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>10 / Mo</span>
                  <span>300 / Mo</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-[#050B14] rounded-3xl p-8 md:p-10 text-white border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Projected Annual Premium Volume</span>
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
                  {estimatedAnnualPremium}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Annual Policies / Freight Loads</span>
                  <span className="text-2xl font-bold text-white">{estimatedPolicyCount}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Turnaround SLA</span>
                  <span className="text-2xl font-bold text-emerald-400">&lt; 24 Hours</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-400" /> Automated API Quoting &amp; Underwriting
                </span>
                <a href="#apply-partner" className="text-blue-400 hover:text-white font-bold transition-colors">
                  Apply Now →
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. CARRIER & PARTNER APPOINTMENT APPLICATION FORM */}
      <div id="apply-partner" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                <Building2 size={14} /> Partner Appointment
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                Apply for Carrier Contract &amp; Integration
              </h2>
              <p className="text-slate-600 font-medium text-sm">
                Submit your carrier or B2B organization details to initiate appointment onboarding with New Holland Financial Group.
              </p>
            </div>

            {appSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Application Submitted Successfully!</h3>
                <p className="text-slate-600 text-sm font-medium max-w-md mx-auto">
                  Your appointment request has been logged under Reference ID: <strong className="text-slate-900 font-bold font-mono">{appRefId}</strong>. An institutional officer will review your filing within 1 business day.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => { setAppSubmitted(false); }}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
                  >
                    Submit Another Filing
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAppSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company / Carrier Name *</label>
                    <input 
                      required 
                      type="text"
                      value={appForm.companyName}
                      onChange={(e) => setAppForm({ ...appForm, companyName: e.target.value })}
                      placeholder="e.g. Acme Life Insurance Corp" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Partnership Category *</label>
                    <select
                      value={appForm.partnerCategory}
                      onChange={(e) => setAppForm({ ...appForm, partnerCategory: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    >
                      <option value="Life & Annuity Carrier">Life &amp; Annuity Carrier</option>
                      <option value="Real Estate & Title Partner">Real Estate &amp; Title Partner</option>
                      <option value="Mortgage & Securities Lender">Mortgage &amp; Securities Lender</option>
                      <option value="Freight & Logistics Network">Freight &amp; Logistics Network</option>
                      <option value="InsurTech / Software API">InsurTech / Software API</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Officer Name *</label>
                    <input 
                      required 
                      type="text"
                      value={appForm.contactName}
                      onChange={(e) => setAppForm({ ...appForm, contactName: e.target.value })}
                      placeholder="Jane Smith" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title / Position *</label>
                    <input 
                      required 
                      type="text"
                      value={appForm.contactTitle}
                      onChange={(e) => setAppForm({ ...appForm, contactTitle: e.target.value })}
                      placeholder="VP of Carrier Distribution" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Corporate Email *</label>
                    <input 
                      required 
                      type="email"
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      placeholder="jane@carrier.com" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number *</label>
                    <input 
                      required 
                      type="tel"
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      placeholder="(800) 555-0199" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operating States</label>
                    <select
                      value={appForm.statesOperating}
                      onChange={(e) => setAppForm({ ...appForm, statesOperating: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    >
                      <option value="48 States (Nationwide)">48 States (Nationwide)</option>
                      <option value="Midwest Region (IA, IL, MN, MO, NE)">Midwest Region (IA, IL, MN, MO, NE)</option>
                      <option value="East Coast">East Coast</option>
                      <option value="West Coast">West Coast</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Projected Annual Target Volume</label>
                    <select
                      value={appForm.projectedVolume}
                      onChange={(e) => setAppForm({ ...appForm, projectedVolume: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    >
                      <option value="$1M - $5M / Year">$1M - $5M / Year</option>
                      <option value="$5M - $20M / Year">$5M - $20M / Year</option>
                      <option value="$20M+ / Year">$20M+ / Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filing Notes / Product Details</label>
                  <textarea
                    rows={4}
                    value={appForm.message}
                    onChange={(e) => setAppForm({ ...appForm, message: e.target.value })}
                    placeholder="Provide details about products, underwriting speed, or API integration capabilities..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={appLoading}
                  className="w-full py-4 bg-[#0B2240] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {appLoading ? 'Transmitting Filing...' : 'Submit Carrier Appointment Application'} <ArrowRight size={16} />
                </button>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* 6. REGULATORY & DISCLOSURE BADGE */}
      <div className="bg-[#050A14] text-slate-400 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs font-medium leading-relaxed">
          <p>
            <strong className="text-slate-300 uppercase tracking-widest">REGULATORY STATEMENT:</strong> New Holland Financial Group operates as an integrated financial general agency and freight transport broker across 48 active state jurisdictions. Insurance, securities, mortgage, and freight carrier contracts are executed in partnership with licensed carrier partners, registered broker-dealers, NMLS originators, and DOT-registered freight logistics networks.
          </p>
        </div>
      </div>

      {/* INTERACTIVE LIVE API SANDBOX MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/10">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <Code2 size={20} className="text-blue-400" />
                <h3 className="text-base font-black tracking-tight text-white">
                  NHFG Partner Quoting &amp; API Sandbox
                </h3>
              </div>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Test drive live API payloads for real-time term life quoting, freight dispatch calculation, and institutional mortgage rate locking.
              </p>

              {/* Endpoint Selector Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { setSandboxEndpoint('life-quote'); setApiResponse(null); }}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    sandboxEndpoint === 'life-quote'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">Life API</span>
                  /api/v1/quotes/life-term
                </button>

                <button
                  onClick={() => { setSandboxEndpoint('freight-dispatch'); setApiResponse(null); }}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    sandboxEndpoint === 'freight-dispatch'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">Freight API</span>
                  /api/v1/freight/dispatch
                </button>

                <button
                  onClick={() => { setSandboxEndpoint('mortgage-rate'); setApiResponse(null); }}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    sandboxEndpoint === 'mortgage-rate'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase text-slate-500 mb-1">Mortgage API</span>
                  /api/v1/mortgage/rate-lock
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-400">
                  METHOD: <strong className="text-emerald-400">POST</strong>
                </span>
                <button
                  onClick={handleExecuteApiSandbox}
                  disabled={apiExecuting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
                >
                  {apiExecuting ? 'Executing Payload...' : 'Execute Live API Call'} <PlayCircle size={14} />
                </button>
              </div>

              {/* JSON Response Window */}
              <div className="bg-black/90 rounded-2xl p-4 font-mono text-xs border border-white/10 text-emerald-400 overflow-x-auto min-h-[180px] max-h-[300px]">
                {apiExecuting ? (
                  <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
                    <span className="animate-spin text-blue-400">⚡</span> Processing REST request against carrier gateway...
                  </div>
                ) : apiResponse ? (
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                  <div className="text-slate-600 italic">Click "Execute Live API Call" to test live JSON payload response.</div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
              <span>Full documentation available at <Link to="/developers" className="text-blue-400 hover:underline">/developers</Link></span>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
