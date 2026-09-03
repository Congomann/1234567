import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube
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
    <footer className="bg-[#030712] text-slate-400 pt-16 pb-12 border-t border-slate-900 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* TOP NEWSLETTER BRIEFING */}
        <div className="border-b border-slate-900 pb-12 mb-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <h3 className="text-3xl font-black text-white tracking-tight mb-2">
              Subscribe to New Holland Financial Updates
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Get rate updates, real estate market insights, and financial advisory directly to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-3 bg-emerald-950/45 border border-emerald-800/80 text-emerald-400 px-8 py-3.5 rounded-full font-bold text-xs">
                <CheckCircle2 size={16} /> Subscribed Successfully
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <div className="relative w-full">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-900/60 border border-slate-800 rounded-full text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                >
                  Subscribe <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 5-COLUMN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* COLUMN 1: BRAND SUMMARY */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex-shrink-0">
                {companySettings?.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                    <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
                    <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
                    <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-white tracking-tighter leading-none uppercase">NEW HOLLAND</span>
                <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase">FINANCIAL GROUP</span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Helping you grow, protect, and preserve what matters most with customized wealth, insurance, real estate, and freight logistics solutions.
            </p>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FOLLOW US</h4>
              <div className="flex items-center gap-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                  <Facebook size={14} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                  <Twitter size={14} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                  <Linkedin size={14} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                  <Instagram size={14} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                  <Youtube size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2: SOLUTIONS & SERVICES */}
          <div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
              SOLUTIONS &amp; SERVICES
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/products" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Solutions Overview
                </Link>
              </li>
              <li>
                <Link to="/real-estate" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link to="/logistics" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Freight &amp; Logistics
                </Link>
              </li>
              <li>
                <Link to="/life-insurance" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Life Insurance
                </Link>
              </li>
              <li>
                <Link to="/mortgage" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Mortgages &amp; Loans
                </Link>
              </li>
              <li>
                <Link to="/securities" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Securities &amp; Wealth
                </Link>
              </li>
              <li>
                <Link to="/dsm-property-solutions" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  DSM Property Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: RESOURCES */}
          <div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
              RESOURCES
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/advisors" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Advisors Directory
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Schedule Advisory
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Agent Portal
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Financial Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: COMPANY */}
          <div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
              COMPANY
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  About New Holland
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Annual Report
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link to="/partnership" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Our Partners
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Careers &amp; Join Team
                </Link>
              </li>
              <li>
                <Link to="/developers" className="text-slate-400 hover:text-white font-bold text-sm block transition-all hover:translate-x-1">
                  Developer APIs
                </Link>
              </li>
            </ul>
          </div>
          
          {/* COLUMN 5: CONTACT US */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              CONTACT US
            </h4>
            
            {!companySettings?.hideDirectLine && (
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">DIRECT LINE</span>
                <span className="text-white font-black text-sm block">
                  (800) 555-0199
                </span>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">OFFICE LINE</span>
              <span className="text-white font-black text-sm block">
                (515) 318-7450
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">DIRECT EMAIL</span>
              <div className="text-white text-sm flex flex-col gap-1 transition-colors">
                <a href="mailto:info@newhollandfinancial.com" className="hover:text-blue-400 font-bold truncate">info@nhfg.com</a>
                <a href="mailto:sales@newhollandfinancial.com" className="hover:text-blue-400 font-bold text-slate-400 truncate">sales@nhfg.com</a>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">HEADQUARTERS</span>
              <p className="text-white font-bold text-sm leading-relaxed">
                Des Moines, IA
              </p>
            </div>
          </div>

        </div>

        {/* REGULATORY COMPLIANCE STATEMENT */}
        <div className="border-t border-slate-900 pt-8 pb-6 text-slate-500 text-[11px] font-semibold leading-relaxed">
          <p>
            <strong className="text-slate-400 uppercase tracking-widest">REGULATORY DISCLOSURE:</strong> New Holland Financial Group provides integrated financial, real estate, mortgage, insurance, and freight brokerage services across 48 active state jurisdictions. Securities, Wealth Management, and Mortgage solutions are offered in partnership with licensed institutional partners, registered broker-dealers, and NMLS originators while direct firm licensure applications remain in process.
          </p>
        </div>

        {/* BOTTOM BAR: COPYRIGHT & LEGAL LINKS */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>
            <Link to="/transparency" className="hover:text-slate-300 transition-colors">State Disclosures</Link>
            <Link to="/developers" className="hover:text-slate-300 transition-colors">Developer Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
