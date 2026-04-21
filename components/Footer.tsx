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
  Globe
} from 'lucide-react';
import { useData } from '../context/DataContext';

// Custom TikTok Icon
const TikTokIcon = ({ size, className }: { size?: number, className?: string }) => (
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
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return Facebook;
      case 'LinkedIn': return Linkedin;
      case 'Twitter': return Twitter;
      case 'X': return Twitter;
      case 'Instagram': return Instagram;
      case 'YouTube': return Youtube;
      case 'TikTok': return TikTokIcon;
      default: return Globe;
    }
  };

  const socialLinks = Array.isArray(companySettings.socialLinks) 
    ? companySettings.socialLinks.filter(link => link.url && link.url !== '#' && link.url.trim() !== '')
    : [];

  // Safely parse multiple emails if the user adds them separated by commas
  const defaultEmails = "General Inquiry: info@newhollandfinancial.com, Sales: sales@newhollandfinancial.com";
  const emailsList = (companySettings.email || defaultEmails).split(',').map(e => e.trim()).filter(e => e);

  return (
    <footer className="bg-[#0B2240] text-white pt-16 pb-8 border-t border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">

          {/* Brand Column */}
          <div className="space-y-6 lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 group w-max">
              <div className="relative w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                  <rect x="5" y="15" width="90" height="60" rx="12" fill="#F59E0B" />
                  <rect x="10" y="35" width="80" height="55" rx="12" fill="#FCD34D" />
                  <rect x="42" y="52" width="16" height="22" rx="4" fill="#B45309" fillOpacity="0.25" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-none text-white tracking-tight">New Holland</span>
                <span className="text-[0.6rem] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Financial Group</span>
              </div>
            </Link>
            <p className="text-slate-400 text-[13px] leading-relaxed font-medium max-w-[280px]">
              {companySettings.footerDescription || 'Providing tailored insurance solutions that secure financial peace of mind for individuals, families, and businesses.'}
            </p>
            <div className="flex gap-2.5 pt-1">
              {socialLinks.map((link, i) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-full hover:bg-blue-600 hover:text-white text-slate-400 transition-all duration-300 border border-white/5 hover:border-blue-500/30">
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Insurance Column */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Insurance
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Life Insurance', path: '/life-insurance' },
                { name: 'Auto Insurance', path: '/auto-insurance' },
                { name: 'Business Insurance', path: '/business-insurance' },
                { name: 'Group Benefits', path: '/group-benefits' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white text-[13px] font-bold transition-all hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Financial & Real Estate Column */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Financial & Real Estate
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Mortgage Lending', path: '/mortgage' },
                { name: 'Securities', path: '/securities' },
                { name: 'Real Estate Hub', path: '/real-estate' },
                { name: 'Investments', path: '/investments' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white text-[13px] font-bold transition-all hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Freight & Logistics Column */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Freight & Logistics
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Freight Shipping', path: '/logistics' },
                { name: 'Freight Brokerage', path: '/logistics' },
                { name: 'Dispatch Services', path: '/logistics' },
                { name: 'Live Load Board', path: '/logistics/loads' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white text-[13px] font-bold transition-all hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Find Advisor Column */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Find Advisor
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Find an Advisor', path: '/advisors' },
                { name: 'Join the Team', path: '/join' },
                { name: 'Resources', path: '/resources' },
                { name: 'Agent Portal', path: '/login' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white text-[13px] font-bold transition-all hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Contact Us
            </h3>
            <div className="space-y-5">

              <div className="flex gap-3 group items-start">
                <div className="flex-shrink-0 w-10 h-10 mt-0.5 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-white/5 group-hover:border-blue-500/50 shadow-lg group-hover:shadow-blue-900/20">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Call Us</p>
                  <a href={`tel:${companySettings.phone}`} className="text-white font-bold text-sm hover:text-blue-400 transition-colors">
                    {companySettings.phone}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 group items-start">
                <div className="flex-shrink-0 w-10 h-10 mt-0.5 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-white/5 group-hover:border-blue-500/50 shadow-lg group-hover:shadow-blue-900/20">
                  <Mail size={16} />
                </div>
                <div className="overflow-hidden flex flex-col">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">Email Us</p>
                  <div className="flex flex-col gap-3">
                    {emailsList.length > 0 ? emailsList.map((emailStr, idx) => {
                      const match = emailStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                      const mailto = match ? `mailto:${match[0]}` : `mailto:${emailStr}`;
                      const parts = emailStr.split(':');
                      const isRevealed = revealedIdx === idx;

                      if (parts.length > 1 && match && parts[1].includes(match[0])) {
                        const label = parts[0].trim();
                        return (
                          <div key={idx} className="flex flex-col group">
                            <button 
                              onClick={() => setRevealedIdx(isRevealed ? null : idx)}
                              className="w-max flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-wider mb-0.5 hover:text-blue-400 transition-colors duration-300"
                            >
                              {label}
                              <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all duration-300 ${isRevealed ? 'scale-150 shadow-[0_0_8px_#3b82f6]' : 'opacity-30'}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-500 ease-out ${isRevealed ? 'max-h-12 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}>
                              <a href={mailto} className="text-white font-semibold text-[14px] hover:text-blue-300 transition-all duration-300">
                                {parts[1].trim()}
                              </a>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="flex flex-col group">
                          <button 
                            onClick={() => setRevealedIdx(isRevealed ? null : idx)}
                            className="w-max flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-wider mb-0.5 hover:text-blue-400 transition-colors duration-300"
                          >
                            Email
                            <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all duration-300 ${isRevealed ? 'scale-150 shadow-[0_0_8px_#3b82f6]' : 'opacity-30'}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-500 ease-out ${isRevealed ? 'max-h-12 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}>
                            <a href={mailto} className="text-white font-semibold text-[14px] hover:text-blue-300 transition-all duration-300">
                              {emailStr}
                            </a>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="flex flex-col group">
                        <button 
                          onClick={() => setRevealedIdx(revealedIdx === 999 ? null : 999)}
                          className="w-max flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-wider mb-0.5 hover:text-blue-400 transition-colors duration-300"
                        >
                          General
                          <div className={`w-1 h-1 rounded-full bg-blue-500 transition-all duration-300 ${revealedIdx === 999 ? 'scale-150 shadow-[0_0_8px_#3b82f6]' : 'opacity-30'}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-out ${revealedIdx === 999 ? 'max-h-12 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}>
                          <a href="mailto:info@newhollandfinancial.com" className="text-white font-semibold text-[14px] hover:text-blue-300 transition-all duration-300">
                            info@newhollandfinancial.com
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 group items-center">
                <div className="flex-shrink-0 w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 border border-white/5 group-hover:border-blue-500/50 shadow-lg group-hover:shadow-blue-900/20">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Visit Us</p>
                  <p className="text-white font-bold text-[14px] leading-tight flex flex-col">
                    {!companySettings.hideStreetAddress && companySettings.address && (
                      <span className="text-slate-400 text-[12px] font-medium mb-0.5">{companySettings.address}</span>
                    )}
                    <span>
                      {[companySettings.city, companySettings.state].filter(Boolean).join(', ')} {companySettings.zip}
                    </span>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-slate-400 text-xs mb-3 font-bold">
            &copy; {new Date().getFullYear()} New Holland Financial Group
          </p>

          <div className="flex justify-center gap-6 mb-6">
            <Link to="/privacy" className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Use</Link>
          </div>

          <p className="text-slate-500/70 text-[11px] max-w-4xl mx-auto leading-relaxed font-medium">
            This website is for informational purposes only and does not constitute a complete description of our investment services or performance. This website is in no way a solicitation or offer to sell securities or investment advisory services except, where applicable, in states where we are registered or where an exemption or exclusion from such registration exists.
          </p>
        </div>
      </div>
    </footer>
  );
};
