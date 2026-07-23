import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';

// Custom TikTok Icon
const TikTokIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

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

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return Facebook;
      case 'LinkedIn': return Linkedin;
      case 'Twitter':
      case 'X': return Twitter;
      case 'Instagram': return Instagram;
      case 'YouTube': return Youtube;
      case 'TikTok': return TikTokIcon;
      default: return Globe;
    }
  };

  const socialLinks = Array.isArray(companySettings.socialLinks)
    ? companySettings.socialLinks.filter(link => link.url && link.url !== '#' && link.url.trim() !== '')
    : [
        { platform: 'Instagram', url: 'https://instagram.com/remmyshabani' },
        { platform: 'TikTok', url: 'https://tiktok.com/@remmyshabani' },
        { platform: 'Facebook', url: 'https://facebook.com/remmyshabani' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' }
      ];

  const primaryPhone = companySettings.phone || '(717) 847-9638';
  const secondaryPhone = '(515) 318-7450';
  const primaryEmail = companySettings.email || 'remmyk@newhollandfinancial.com';
  const addressText = companySettings.hideStreetAddress 
    ? `${companySettings.city || 'Des Moines'}, ${companySettings.state || 'IA'}`
    : `${companySettings.address || 'Des Moines'}, ${companySettings.city || ''} ${companySettings.state || 'IA 50309'}`.replace(/\s+/g, ' ');

  return (
    <footer className="bg-[#080d19] text-white pt-20 pb-12 border-t border-white/10 font-sans relative overflow-hidden selection:bg-blue-500/30">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* TOP NEWSLETTER / MARKET INSIGHTS CARD */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-indigo-950/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-20 shadow-2xl shadow-black/40 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Market Intelligence Brief
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              Stay Ahead with New Holland Financial
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Receive key financial updates, rate forecasts, real estate intelligence, and wealth strategies.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-8 py-4 rounded-full font-bold text-sm">
                <CheckCircle2 size={18} /> Subscribed to Market Intelligence
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <div className="relative w-full">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Subscribe <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 5-COLUMN MAIN NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* BRAND COLUMN (4 COLS) */}
          <div className="space-y-6 lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 group w-max">
              <div className="relative w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                {companySettings?.logoUrl ? (
                  <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                    <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
                    <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
                    <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-none text-white tracking-tight uppercase">New Holland</span>
                <span className="text-[10px] font-extrabold text-blue-400 tracking-[0.2em] uppercase mt-1">Financial Group</span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-sm">
              Helping you grow, protect, and preserve what matters most with integrated wealth, real estate, insurance, and freight solutions.
            </p>

            {/* Social Links Pill Badges */}
            <div className="pt-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Connect With Us</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((item, idx) => {
                  const Icon = getSocialIcon(item.platform);
                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-full text-xs font-bold text-slate-300 hover:text-white transition-all"
                    >
                      <Icon size={14} />
                      <span>{item.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: SOLUTIONS */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              Solutions
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Life Insurance', path: '/life-insurance' },
                { name: 'Auto & Commercial', path: '/auto-insurance' },
                { name: 'Business Insurance', path: '/business-insurance' },
                { name: 'Group Benefits', path: '/group-benefits' },
                { name: 'Mortgages & Rates', path: '/mortgage' },
                { name: 'Real Estate Hub', path: '/real-estate' },
                { name: 'DSM Property', path: '/dsm-property-solutions' },
                { name: 'Securities & Wealth', path: '/securities' },
                { name: 'Freight & Logistics', path: '/logistics' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-white text-xs font-semibold transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: ECOSYSTEM & TOOLS */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              Ecosystem
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Explore Solutions', path: '/products' },
                { name: 'Advisors Directory', path: '/advisors' },
                { name: 'Schedule Advisory', path: '/schedule' },
                { name: 'Client Portal', path: '/login' },
                { name: 'Advisor Terminal', path: '/login' },
                { name: 'Financial Resources', path: '/resources' },
                { name: 'Developer APIs', path: '/developers' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-white text-xs font-semibold transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CORPORATE */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              Corporate
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'About NHFG', path: '/about' },
                { name: 'Annual Report', path: '/transparency' },
                { name: 'Press Releases', path: '/press' },
                { name: 'Careers & Join Team', path: '/join' },
                { name: 'Carrier Partners', path: '/partnership' },
                { name: 'Contact Support', path: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-white text-xs font-semibold transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5: DIRECT CONTACT STACK (2 COLS) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              Contact Us
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Direct Line</span>
                <a href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 font-bold transition-colors block">
                  {primaryPhone}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Office Line</span>
                <a href={`tel:${secondaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 font-bold transition-colors block">
                  {secondaryPhone}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Direct Email</span>
                <a href={`mailto:${primaryEmail}`} className="text-white hover:text-blue-400 font-bold transition-colors block truncate">
                  {primaryEmail}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Headquarters</span>
                <span className="text-slate-300 font-bold block leading-relaxed">
                  {addressText}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* REGULATORY NOTICE BAR */}
        <div className="border-t border-white/10 pt-8 pb-8 text-slate-500 text-[11px] font-medium leading-relaxed">
          <p>
            <strong className="text-slate-400 uppercase tracking-widest">Regulatory Disclosure:</strong> New Holland Financial Group is a multi-disciplinary financial services, real estate, mortgage, insurance, and logistics brokerage operating across 48 active state jurisdictions. All products, loans, and advisory services are subject to regulatory licensing, underwriting, and state compliance verification.
          </p>
        </div>

        {/* BOTTOM BAR: COPYRIGHT & LEGAL LINKS */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <p>&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/transparency" className="hover:text-white transition-colors">State Disclosures</Link>
            <Link to="/developers" className="hover:text-white transition-colors">Developer Portal</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
