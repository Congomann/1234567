import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  Home as HomeIcon, 
  Briefcase, 
  FileText, 
  Landmark, 
  BarChart3, 
  Key, 
  Wrench, 
  Globe, 
  Send, 
  Handshake, 
  Scale, 
  Newspaper, 
  Shield, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { companySettings } = useData();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#F8FAFC] text-slate-900 pt-16 pb-12 border-t border-slate-200/80 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* TOP NEWSLETTER BRIEFING */}
        <div className="border-b border-slate-200/80 pb-12 mb-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/60 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Financial Insights Newsletter
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#0B2240] tracking-tight mb-2">
              Subscribe to New Holland Financial Updates
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Get rate updates, real estate market insights, and financial advisory directly to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-8 py-3.5 rounded-full font-bold text-xs">
                <CheckCircle2 size={16} /> Subscribed Successfully
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <div className="relative w-full">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#0B2240] hover:bg-slate-800 text-white font-black rounded-full text-[11px] uppercase tracking-widest transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                >
                  Subscribe <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* EXACT 4-COLUMN FOOTER GRID MATCHING USER SCREENSHOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
          
          {/* COLUMN 1: INSURANCE */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-[#0B2240] tracking-tight mb-1">
                Insurance
              </h3>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                PROTECT WHAT MATTERS MOST.
              </span>
            </div>

            <ul className="space-y-4">
              <li>
                <Link to="/life-insurance" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <ShieldCheck className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Life Insurance</span>
                </Link>
              </li>
              <li>
                <Link to="/auto-insurance" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Truck className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base leading-tight">Auto &amp; Commercial</span>
                </Link>
              </li>
              <li>
                <Link to="/property-insurance" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <HomeIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base leading-tight">Property Solutions</span>
                </Link>
              </li>
              <li>
                <Link to="/business-insurance" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base leading-tight">Business Insurance</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Group Benefits</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: FINANCIAL & PROPERTY */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-[#0B2240] tracking-tight leading-tight mb-1">
                Financial &amp; Property
              </h3>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                BUILD, MANAGE, AND MAINTAIN YOUR ASSETS.
              </span>
            </div>

            <ul className="space-y-4">
              <li>
                <Link to="/mortgage" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Landmark className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Mortgage</span>
                </Link>
              </li>
              <li>
                <Link to="/securities" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <BarChart3 className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Securities</span>
                </Link>
              </li>
              <li>
                <Link to="/real-estate" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Key className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Real Estate</span>
                </Link>
              </li>
              <li>
                <Link to="/dsm-property-solutions" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Wrench className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base leading-tight">DSM Property Solutions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: FREIGHT & LOGISTICS */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-[#0B2240] tracking-tight leading-tight mb-1">
                Freight &amp; Logistics
              </h3>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                MOVE YOUR BUSINESS FORWARD.
              </span>
            </div>

            <ul className="space-y-4">
              <li>
                <Link to="/logistics" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Truck className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Freight Shipping</span>
                </Link>
              </li>
              <li>
                <Link to="/logistics" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Globe className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Freight Brokerage</span>
                </Link>
              </li>
              <li>
                <Link to="/logistics" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Send className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Dispatch Services</span>
                </Link>
              </li>
              <li>
                <Link to="/logistics" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Truck className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Live Load</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: CORPORATE */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-[#0B2240] tracking-tight mb-1">
                Corporate
              </h3>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                TRANSPARENCY &amp; NEWS.
              </span>
            </div>

            <ul className="space-y-4">
              <li>
                <Link to="/partnership" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Handshake className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base leading-tight">Partnerships &amp; Carriers</span>
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Scale className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Annual Report</span>
                </Link>
              </li>
              <li>
                <Link to="/press" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Newspaper className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Press Releases</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Shield className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">About NHFG</span>
                </Link>
              </li>
              <li>
                <Link to="/advisors" className="flex items-center gap-3 text-slate-800 hover:text-blue-600 transition-colors group">
                  <Globe className="h-5 w-5 text-slate-400 group-hover:text-blue-600 stroke-[1.5] shrink-0 transition-colors" />
                  <span className="font-bold text-sm lg:text-base">Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* REGULATORY COMPLIANCE STATEMENT */}
        <div className="border-t border-slate-200/80 pt-8 pb-6 text-slate-500 text-[11px] font-medium leading-relaxed">
          <p>
            <strong className="text-slate-700 uppercase tracking-widest">REGULATORY DISCLOSURE:</strong> New Holland Financial Group provides integrated financial, real estate, mortgage, insurance, and freight brokerage services across 48 active state jurisdictions. Securities, Wealth Management, and Mortgage solutions are offered in partnership with licensed institutional partners, registered broker-dealers, and NMLS originators while direct firm licensure applications remain in process.
          </p>
        </div>

        {/* BOTTOM BAR: COPYRIGHT & LEGAL LINKS */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Use</Link>
            <Link to="/transparency" className="hover:text-slate-900 transition-colors">State Disclosures</Link>
            <Link to="/developers" className="hover:text-slate-900 transition-colors">Developer Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
