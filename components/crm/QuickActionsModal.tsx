import React, { useState, useEffect } from 'react';
import { Search, Command, X, TrendingUp, Phone, Landmark, Database, Users, Zap, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTemplates: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({ isOpen, onClose, onOpenTemplates }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Keybindings listener for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { title: 'Securities & Wealth Management', category: 'Sales', path: '/crm/securities', icon: TrendingUp, color: 'text-amber-500 bg-amber-50' },
    { title: 'SignalWire Voice Call & AI Qualify', category: 'Telephony', path: '/crm/telephony', icon: Phone, color: 'text-blue-500 bg-blue-50' },
    { title: 'Plaid Instant ACH Bank Verification', category: 'Finance', path: '/crm/bank-verification', icon: Landmark, color: 'text-emerald-500 bg-emerald-50' },
    { title: 'People & Leads Database', category: 'Records', path: '/crm/leads', icon: Users, color: 'text-indigo-500 bg-indigo-50' },
    { title: 'Marketing Campaigns Pro', category: 'Marketing', path: '/crm/campaigns', icon: Zap, color: 'text-purple-500 bg-purple-50' },
    { title: 'Workspace Templates & Use Cases', category: 'Setup', action: () => { onClose(); onOpenTemplates(); }, icon: Command, color: 'text-slate-700 bg-slate-100' }
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-slide-up">
        
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            autoFocus
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-md border border-slate-200">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.path) { navigate(item.path); onClose(); }
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">No commands found for "{query}"</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↵</kbd> Select</span>
          </div>
          <span>New Holland Financial</span>
        </div>

      </div>
    </div>
  );
};
