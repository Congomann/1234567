import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface ReminderToastProps {
  activeReminder: CalendarEvent | null;
  setActiveReminder: (reminder: CalendarEvent | null) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  activeReminder,
  setActiveReminder
}) => {
  return (
    <AnimatePresence>
      {activeReminder && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="fixed bottom-8 right-8 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 max-w-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full animate-pulse">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Meeting Starting Soon</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">{activeReminder.title}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeReminder.time}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveReminder(null)}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Dismiss
            </button>
            <button 
              onClick={() => { 
                  window.open(activeReminder.meetingLink || 'https://meet.google.com', '_blank'); 
                  setActiveReminder(null); 
              }}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20"
            >
              Join Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
