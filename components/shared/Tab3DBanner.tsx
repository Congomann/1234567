import React from 'react';
import { motion } from 'framer-motion';
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

  const getGradientStyle = (gradient: BannerCard['gradient']) => {
    switch (gradient) {
      case 'cyan':
        return 'bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 text-white shadow-cyan-500/20';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-amber-500/20';
      case 'pink':
        return 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white shadow-purple-500/20';
      case 'purple':
        return 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white shadow-indigo-500/20';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-teal-500/20';
      default:
        return 'bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 text-white shadow-cyan-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const gradientClass = getGradientStyle(card.gradient);
        const isDarkText = card.gradient === 'yellow';

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              if (card.linkPath) {
                if (card.linkPath.startsWith('#')) {
                  document.getElementById(card.linkPath.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate(card.linkPath);
                }
              }
            }}
            className={`${gradientClass} p-6 sm:p-7 rounded-[2rem] shadow-xl ${
              card.linkPath ? 'cursor-pointer' : ''
            } relative overflow-hidden flex items-center justify-between min-h-[160px] group transition-all duration-300 border border-white/20`}
          >
            {/* Ambient Glass Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none" />

            {/* Left Content Area (Guaranteed No Overlap) */}
            <div className="relative z-20 flex-1 pr-6 max-w-[70%] flex flex-col justify-center">
              <span
                className={`text-[11px] font-black uppercase tracking-widest block mb-1.5 ${
                  isDarkText ? 'text-slate-900/75' : 'text-white/80'
                }`}
              >
                {card.title}
              </span>
              <p
                className={`text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 break-words ${
                  isDarkText ? 'text-slate-950' : 'text-white'
                }`}
              >
                {card.value}
              </p>

              {card.subtitle && (
                <p
                  className={`text-xs font-semibold line-clamp-2 ${
                    isDarkText ? 'text-slate-900/80' : 'text-white/80'
                  }`}
                >
                  {card.subtitle}
                </p>
              )}

              {card.linkText && (
                <span
                  className={`text-[11px] font-extrabold mt-3 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${
                    isDarkText ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {card.linkText} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Right Side Levitating 3D Glass Badge (Pushed to Far Right, ZERO Overlap) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.4
              }}
              className="relative z-20 flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white/25 backdrop-blur-xl border border-white/40 shadow-lg flex items-center justify-center text-3xl sm:text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300"
            >
              {card.emoji}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
