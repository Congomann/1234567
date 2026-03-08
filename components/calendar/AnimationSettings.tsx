import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, User, Smile, Briefcase } from 'lucide-react';

interface AnimationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  animationMode: 'Minimal' | 'Professional' | 'Friendly' | 'Dynamic';
  setAnimationMode: (mode: 'Minimal' | 'Professional' | 'Friendly' | 'Dynamic') => void;
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  isOpen,
  onClose,
  animationMode,
  setAnimationMode
}) => {
  const modes = [
    { id: 'Minimal', icon: Zap, label: 'Minimal', desc: 'Fast, no-nonsense transitions.' },
    { id: 'Professional', icon: Briefcase, label: 'Professional', desc: 'Smooth, standard easing.' },
    { id: 'Friendly', icon: Smile, label: 'Friendly', desc: 'Bouncy, playful interactions.' },
    { id: 'Dynamic', icon: User, label: 'Dynamic', desc: 'High energy, physics-based.' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Settings className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Experience Settings</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customize Interactions</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-xs tracking-widest">Close</button>
            </div>

            <div className="space-y-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAnimationMode(mode.id as any)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${animationMode === mode.id ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className={`p-3 rounded-xl ${animationMode === mode.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <mode.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className={`font-black uppercase tracking-wide text-sm ${animationMode === mode.id ? 'text-blue-900' : 'text-slate-700'}`}>{mode.label}</h4>
                    <p className="text-xs font-medium text-slate-400">{mode.desc}</p>
                  </div>
                  {animationMode === mode.id && (
                    <div className="ml-auto w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
