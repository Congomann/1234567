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
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Building2,
  Truck,
  Shield,
  Landmark,
  BarChart3,
  Wrench
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

  const socialLinks = Array.isArray(companySettings.socialLinks) && companySettings.socialLinks.length > 0
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
    <footer className="bg-[#050B14] text-white pt-16 pb-12 border-t border-white/10 font-sans relative overflow-hidden selection:bg-blue-500/30">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* TOP NEWSLETTER BRIEF */}
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 mb-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Financial Insights Newsletter
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              Subscribe to New Holland Financial Updates
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Get rate updates, real estate market insights, and financial advisory directly to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-8 py-4 rounded-full font-bold text-sm">
                <CheckCircle2 size={18} /> Subscribed Successfully
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

        {/* 4 BALANCED SECTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
          
          {/* SECTION 1: BRAND & IDENTITY */}
          <div className="space-y-6">
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

            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Helping you grow, protect, and preserve what matters most with customized wealth, insurance, real estate, and freight logistics solutions.
            </p>

            <div className="pt-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Follow Us</p>
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
                      <Icon size={13} />
                      <span>{item.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: SOLUTIONS & SERVICES */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4">
              Solutions &amp; Services
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Real Estate', path: '/real-estate', icon: Building2 },
                { label: 'Freight & Logistics', path: '/logistics', icon: Truck },
                { label: 'Life Insurance', path: '/life-insurance', icon: Shield },
                { label: 'Mortgages & Loans', path: '/mortgage', icon: Landmark },
                { label: 'Securities & Wealth', path: '/securities', icon: BarChart3 },
                { label: 'DSM Property Solutions', path: '/dsm-property-solutions', icon: Wrench },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 text-xs font-bold text-slate-200 hover:text-white transition-all"
                  >
                    <span className="flex items-center gap-2.5">
                      <link.icon size={15} className="text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>{link.label}</span>
                    </span>
                    <ChevronRight size={13} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: ECOSYSTEM & CORPORATE */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4">
              Ecosystem & Corporate
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Solutions Overview', path: '/products' },
                { name: 'Advisors Directory', path: '/advisors' },
                { name: 'Schedule Advisory', path: '/schedule' },
                { name: 'Client Portal', path: '/login' },
                { name: 'About New Holland', path: '/about' },
                { name: 'Annual Report', path: '/transparency' },
                { name: 'Press Releases', path: '/press' },
                { name: 'Careers & Join Team', path: '/join' },
                { name: 'Developer APIs', path: '/developers' },
                { name: 'Financial Resources', path: '/resources' },
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

          {/* SECTION 4: DIRECT CONTACT STACK */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.2em] uppercase mb-4">
              Contact Us
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Direct Line</span>
                <a href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 font-bold transition-colors block text-sm">
                  {primaryPhone}
                </a>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Office Line</span>
                <a href={`tel:${secondaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 font-bold transition-colors block text-sm">
                  {secondaryPhone}
                </a>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Direct Email</span>
                <a href={`mailto:${primaryEmail}`} className="text-white hover:text-blue-400 font-bold transition-colors block truncate text-xs">
                  {primaryEmail}
                </a>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Headquarters</span>
                <span className="text-slate-300 font-bold block leading-relaxed text-xs">
                  {addressText}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* REGULATORY COMPLIANCE STATEMENT */}
        <div className="border-t border-white/10 pt-8 pb-8 text-slate-500 text-[11px] font-medium leading-relaxed">
          <p>
            <strong className="text-slate-400 uppercase tracking-widest">REGULATORY DISCLOSURE:</strong> New Holland Financial Group provides integrated financial, real estate, mortgage, insurance, and freight brokerage services across 48 active state jurisdictions. Securities, Wealth Management, and Mortgage solutions are offered in partnership with licensed institutional partners, registered broker-dealers, and NMLS originators while direct firm licensure applications remain in process.
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
