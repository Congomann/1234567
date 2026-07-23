import React, { useState, useEffect } from 'react';
import { Search, Phone, Landmark, Bot, TrendingUp, Building2, Shield, FileText, Truck, ArrowRight, X, Sparkles, User, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTemplates: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenTemplates }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { title: 'SignalWire Softphone Call', category: 'Telephony', icon: Phone, action: () => { navigate('/crm/telephony'); onClose(); } },
    { title: 'AI Outbound Lead Qualifier', category: 'Telephony & AI', icon: Bot, action: () => { navigate('/crm/telephony'); onClose(); } },
    { title: 'Plaid Instant ACH Bank Verification', category: 'Banking', icon: Landmark, action: () => { navigate('/crm/bank-verification'); onClose(); } },
    { title: 'Securities & Wealth Management Hub', category: 'Wealth', icon: TrendingUp, action: () => { navigate('/crm/securities'); onClose(); } },
    { title: 'Real Estate & Escrow Pipeline', category: 'Real Estate', icon: Building2, action: () => { navigate('/crm/escrow'); onClose(); } },
    { title: 'Life & Commercial Insurance Policies', category: 'Insurance', icon: Shield, action: () => { navigate('/crm/applications'); onClose(); } },
    { title: 'Configure Workspace Templates / Use Cases', category: 'Workspace', icon: Sparkles, action: () => { onClose(); onOpenTemplates(); } },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 ml-2" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type a command or search records (e.g. Call, Plaid, Securities)..."
            className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1.5">
            Quick Actions & Workflows
          </div>

          {filteredActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={item.action}
                className="flex items-center justify-between p-3.5 hover:bg-blue-50 rounded-2xl cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 px-5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px] font-bold text-slate-600">⌘K</span>
            <span>Global Quick Search</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px] font-bold text-slate-600">ESC</span>
            <span>Close</span>
          </div>
        </div>

      </div>
    </div>
  );
};
