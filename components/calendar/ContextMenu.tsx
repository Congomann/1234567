import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Coffee } from 'lucide-react';

interface ContextMenuProps {
  contextMenu: { x: number, y: number, dateStr: string } | null;
  closeContextMenu: () => void;
  handleQuickAction: (type: 'meeting' | 'reminder' | 'task' | 'off-day') => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  closeContextMenu,
  handleQuickAction
}) => {
  if (!contextMenu) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40" onClick={closeContextMenu} onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ top: contextMenu.y, left: contextMenu.x }}
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-2 w-48 overflow-hidden"
      >
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
          Quick Add
        </div>
        <button onClick={() => handleQuickAction('meeting')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 transition-colors">
          <CalendarIcon className="h-4 w-4" /> Meeting
        </button>
        <button onClick={() => handleQuickAction('reminder')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-500 flex items-center gap-2 transition-colors">
          <AlertCircle className="h-4 w-4" /> Reminder
        </button>
        <button onClick={() => handleQuickAction('task')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
          <CheckCircle2 className="h-4 w-4" /> Task
        </button>
        <button onClick={() => handleQuickAction('off-day')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2 transition-colors">
          <Coffee className="h-4 w-4" /> Off Day
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
