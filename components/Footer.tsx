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
    <footer className="bg-[#051124] text-white pt-20 pb-12 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 text-center md:text-left">
          
          {/* CORE SERVICES */}
          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-10">Core Services</h3>
            <ul className="space-y-4">
              {[
                { name: 'Insurance', path: '/life-insurance' },
                { name: 'Financial Services', path: '/mortgage' },
                { name: 'Real Estate', path: '/real-estate' },
                { name: 'Freight & Logistics', path: '/logistics' },
                { name: 'Find an Advisor', path: '/advisors' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-10">Company</h3>
            <ul className="space-y-4">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Join Our Team', path: '/join' },
                { name: 'Agent Portal', path: '/login' },
                { name: 'Resources', path: '/resources' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-10">Contact</h3>
            <ul className="space-y-5">
              <li>
                <a href={`tel:${companySettings.phone || '800-555-0199'}`} className="flex items-center justify-center md:justify-start gap-3 text-slate-400 hover:text-white group transition-colors">
                  <Phone size={16} className="text-slate-500 group-hover:text-blue-400" />
                  <span className="text-sm font-medium underline decoration-slate-700 underline-offset-4">{companySettings.phone || '800-555-0199'}</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@newhollandfinancial.com" className="flex items-center justify-center md:justify-start gap-3 text-slate-400 hover:text-white group transition-colors">
                  <Mail size={16} className="text-slate-500 group-hover:text-blue-400" />
                  <span className="text-sm font-medium underline decoration-slate-700 underline-offset-4">info@newhollandfinancial.com</span>
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-slate-400">
                <MapPin size={16} className="text-red-500/80" />
                <span className="text-sm font-medium">Des Moines, IA</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-[11px] font-medium tracking-tight">
            &copy; {new Date().getFullYear()} New Holland Financial Group |
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-slate-400 hover:text-white text-[11px] font-bold transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">|</span>
            <Link to="/terms" className="text-slate-400 hover:text-white text-[11px] font-bold transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
