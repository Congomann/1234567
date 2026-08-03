import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Award, Server } from 'lucide-react';

export const SecurityTrustSeal: React.FC = () => {
  const trustItems = [
    { title: '256-Bit SSL Encryption', desc: 'Bank-grade TLS 1.3 cryptographic protection.', icon: Lock },
    { title: 'SOC2 Type II Certified', desc: 'Verified security protocols & access controls.', icon: ShieldCheck },
    { title: 'Plaid Bank Verified', desc: 'Secure direct API bank account verification.', icon: CheckCircle2 },
    { title: 'Institutional Compliance', desc: 'Operating across 48 active state jurisdictions.', icon: Award },
  ];

  return (
    <div className="bg-[#03060D] border-t border-white/10 py-12 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">{item.title}</h4>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
