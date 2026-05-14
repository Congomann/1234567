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
    <footer className="bg-[#051124] text-white pt-16 pb-8 border-t border-white/10 font-sans">
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
              Welcome to New Holland Financial Group
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Insurance', path: '/life-insurance' },
                { name: 'Financial Services', path: '/mortgage' },
                { name: 'Real Estate', path: '/real-estate' },
                { name: 'Freight & Logistics', path: '/logistics' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white hover:text-blue-400 text-[13px] font-bold transition-all"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Company
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Annual Report', path: '/transparency' },
                { name: 'Press Releases', path: '/press' },
                { name: 'Join Our Team', path: '/join' },
                { name: 'Agent Portal', path: '/login' },
                { name: 'Resources', path: '/resources' },
                { name: 'Developer APIs', path: '/developers' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white hover:text-blue-400 text-[13px] font-bold transition-all"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
              Contact Us
            </h3>
            <div className="space-y-5">
              <div className="flex gap-3 group items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-blue-400 border border-white/5">
                  <Phone size={14} />
                </div>
                <div>
                  <a href={`tel:${companySettings.phone || '800-555-0199'}`} className="text-white font-bold text-[13px] hover:text-blue-400 transition-colors">
                    {companySettings.phone || '800-555-0199'}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 group items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-blue-400 border border-white/5">
                  <Mail size={14} />
                </div>
                <div>
                  <a href={`mailto:${emailsList[0]?.split(':').pop()?.trim() || 'info@newhollandfinancial.com'}`} className="text-white font-bold text-[13px] hover:text-blue-400 transition-colors">
                    {emailsList[0]?.split(':').pop()?.trim() || 'info@newhollandfinancial.com'}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 group items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-blue-400 border border-white/5">
                  <MapPin size={14} />
                </div>
                <div>
                  <span className="text-white font-bold text-[13px]">
                    {companySettings.hideStreetAddress 
                      ? `${companySettings.city || 'Des Moines'}, ${companySettings.state || 'IA'}.`
                      : `${companySettings.address || 'Des Moines'}, ${companySettings.city || ''} ${companySettings.state || 'IA'}.`
                    }
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 text-center flex flex-col gap-4">
          <p className="text-slate-400 text-xs font-bold">
            &copy; {new Date().getFullYear()} New Holland Financial Group
          </p>

          <div className="flex justify-center gap-6">
            <Link to="/privacy" className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
