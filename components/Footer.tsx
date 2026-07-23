import React from 'react';
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
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';

// Custom TikTok Icon
const TikTokIcon = ({ size = 15, className = "" }: { size?: number; className?: string }) => (
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
    <footer className="bg-[#050b14] text-white pt-20 pb-12 border-t border-white/10 font-sans relative overflow-hidden selection:bg-blue-500/30">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* 4 DISTINCT SECTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          
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
                <span className="text-[10px] font-extrabold text-blue-400 tracking-[0.25em] uppercase mt-1">Financial Group</span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              Helping you grow, protect, and preserve what matters most with integrated wealth, real estate, insurance, and freight solutions.
            </p>

            {/* Social Pill Buttons */}
            <div className="pt-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Follow Us</span>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((item, idx) => {
                  const Icon = getSocialIcon(item.platform);
                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-full text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
                    >
                      <Icon size={14} />
                      <span>{item.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: SOLUTIONS */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
              Solutions
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'Life Insurance', path: '/life-insurance' },
                { name: 'Auto & Commercial Insurance', path: '/auto-insurance' },
                { name: 'Business Insurance', path: '/business-insurance' },
                { name: 'Group Benefits', path: '/group-benefits' },
                { name: 'Mortgage & Rates', path: '/mortgage' },
                { name: 'Real Estate & Intelligence', path: '/real-estate' },
                { name: 'Property Solutions', path: '/dsm-property-solutions' },
                { name: 'Securities & Wealth', path: '/securities' },
                { name: 'Freight & Logistics', path: '/logistics' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: COMPANY & ECOSYSTEM */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
              Company
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'About New Holland', path: '/about' },
                { name: 'Annual Transparency Report', path: '/transparency' },
                { name: 'Press Releases', path: '/press' },
                { name: 'Careers & Join Team', path: '/join' },
                { name: 'Advisors Directory', path: '/advisors' },
                { name: 'Agent & Advisor Terminal', path: '/login' },
                { name: 'Client Portal', path: '/client-portal' },
                { name: 'Financial Resources', path: '/resources' },
                { name: 'Developer APIs', path: '/developers' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 4: DIRECT CONTACT US */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-black text-blue-400 tracking-[0.25em] uppercase mb-6 flex items-center gap-2">
              Contact Us
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Direct</span>
                  <a href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 font-bold text-xs sm:text-sm transition-colors">
                    {primaryPhone}
                  </a>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Office</span>
                  <a href={`tel:${secondaryPhone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-blue-400 font-bold text-xs sm:text-sm transition-colors">
                    {secondaryPhone}
                  </a>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email</span>
                  <a href={`mailto:${primaryEmail}`} className="text-white hover:text-blue-400 font-bold text-xs sm:text-sm transition-colors block truncate">
                    {primaryEmail}
                  </a>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</span>
                  <span className="text-white font-bold text-xs sm:text-sm block">
                    {addressText}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM LEGAL & COMPLIANCE BAR */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <span>&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-wider">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link to="/transparency" className="hover:text-white transition-colors">State Disclosures</Link>
            <Link to="/developers" className="hover:text-white transition-colors">Developer APIs</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
