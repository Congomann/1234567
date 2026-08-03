import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, ChevronRight, User, Building2, Truck, Shield, Calendar, Phone, Landmark } from 'lucide-react';
import { useData } from '../context/DataContext';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Leads' | 'Clients' | 'Properties' | 'Logistics';
  icon: any;
  action: () => void;
}

export const CRMCommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { leads, clients, properties, setSelectedTab } = useData();
  const navigate = useNavigate();

  // Keyboard Event Listener for Cmd + K / Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationCommands: CommandItem[] = [
    { id: 'nav-dashboard', title: 'Dashboard Terminal', category: 'Navigation', icon: Command, action: () => { setSelectedTab('dashboard'); setIsOpen(false); } },
    { id: 'nav-leads', title: 'Leads Database', category: 'Navigation', icon: User, action: () => { setSelectedTab('leads'); setIsOpen(false); } },
    { id: 'nav-calendar', title: 'Calendar & Schedules', category: 'Navigation', icon: Calendar, action: () => { setSelectedTab('calendar'); setIsOpen(false); } },
    { id: 'nav-telephony', title: 'SignalWire AI Telephony', category: 'Navigation', icon: Phone, action: () => { setSelectedTab('telephony'); setIsOpen(false); } },
    { id: 'nav-bank', title: 'Plaid Bank Verification', category: 'Navigation', icon: Landmark, action: () => { setSelectedTab('bank-verification'); setIsOpen(false); } },
    { id: 'nav-logistics', title: 'Logistics Command Center', category: 'Navigation', icon: Truck, action: () => { setSelectedTab('logistics-command'); setIsOpen(false); } },
    { id: 'nav-signature', title: 'Email Signature Generator', category: 'Navigation', icon: Command, action: () => { setSelectedTab('email-signature'); setIsOpen(false); } },
  ];

  const leadCommands: CommandItem[] = (leads || []).slice(0, 5).map((lead) => ({
    id: `lead-${lead.id}`,
    title: `Lead: ${lead.name} (${lead.interest || 'General'})`,
    category: 'Leads',
    icon: User,
    action: () => {
      setSelectedTab('leads');
      setIsOpen(false);
    }
  }));

  const propertyCommands: CommandItem[] = (properties || []).slice(0, 5).map((prop) => ({
    id: `prop-${prop.id}`,
    title: `Property: ${prop.address} ($${prop.price.toLocaleString()})`,
    category: 'Properties',
    icon: Building2,
    action: () => {
      setSelectedTab('real-estate-cms');
      setIsOpen(false);
    }
  }));

  const allCommands = [...navigationCommands, ...leadCommands, ...propertyCommands];

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4 font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-white">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search leads, properties, CRM tabs... (ESC to exit)"
            className="w-full bg-transparent text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Command Options List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 group-hover:bg-blue-600/30 rounded-xl text-slate-300 group-hover:text-blue-400 transition-colors">
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{cmd.title}</span>
                      <span className="text-[10px] font-semibold text-slate-500 block">{cmd.category}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No commands or CRM records found matching "{query}"
            </div>
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-slate-800 rounded font-bold">Cmd + K</span>
            <span>Toggle Command Bar</span>
          </div>
          <span>Institutional CRM Terminal</span>
        </div>
      </div>
    </div>
  );
};
