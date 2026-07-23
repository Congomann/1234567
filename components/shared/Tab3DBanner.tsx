import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface BannerCard {
  title: string;
  value: string;
  subtitle?: string;
  emoji: string;
  gradient: 'cyan' | 'yellow' | 'pink' | 'purple' | 'emerald';
  linkPath?: string;
  linkText?: string;
}

interface Tab3DBannerProps {
  cards: BannerCard[];
}

export const Tab3DBanner: React.FC<Tab3DBannerProps> = ({ cards }) => {
  const navigate = useNavigate();

  const getGradientClass = (gradient: BannerCard['gradient']) => {
    switch (gradient) {
      case 'cyan':
        return 'gradient-cyan-card';
      case 'yellow':
        return 'gradient-yellow-card';
      case 'pink':
        return 'gradient-pink-card';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
      default:
        return 'gradient-cyan-card';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const gradientClass = getGradientClass(card.gradient);
        const isDarkText = card.gradient === 'cyan' || card.gradient === 'yellow';

        return (
          <div
            key={index}
            onClick={() => card.linkPath && navigate(card.linkPath)}
            className={`${gradientClass} p-7 rounded-[2.5rem] shadow-2xl apple-3d-card ${
              card.linkPath ? 'cursor-pointer' : ''
            } relative overflow-hidden flex flex-col justify-between min-h-[180px]`}
          >
            {/* Text Layer */}
            <div className="relative z-10">
              <span
                className={`text-[11px] font-black uppercase tracking-wider block mb-1 ${
                  isDarkText ? 'text-slate-900/80' : 'text-white/80'
                }`}
              >
                {card.title}
              </span>
              <p
                className={`text-3xl lg:text-4xl font-black tracking-tight ${
                  isDarkText ? 'text-slate-950' : 'text-white'
                }`}
              >
                {card.value}
              </p>

              {card.subtitle && (
                <p
                  className={`text-xs font-semibold mt-1 ${
                    isDarkText ? 'text-slate-900/70' : 'text-white/70'
                  }`}
                >
                  {card.subtitle}
                </p>
              )}

              {card.linkText && (
                <span
                  className={`text-xs font-extrabold mt-3 inline-flex items-center gap-1 hover:underline ${
                    isDarkText ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {card.linkText} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* 3D Floating Asset Illustration */}
            <div
              className="absolute right-4 bottom-2 w-24 h-24 pointer-events-none animate-float-3d"
              style={{ animationDelay: `${index * 0.8}s` }}
            >
              <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-3xl border border-white/40 shadow-xl flex items-center justify-center text-4xl">
                {card.emoji}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
