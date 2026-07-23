import React from 'react';
import { 
  Check, X, TrendingUp, LineChart, Users, Zap, Shield, 
  Landmark, DollarSign, Briefcase, Truck, Newspaper, Rocket, Globe, Edit3 
} from 'lucide-react';

export interface UseCaseTemplate {
  id: string;
  name: string;
  enabled: boolean;
  colorBg: string;
  colorIcon: string;
  icon: any;
}

interface WorkspaceTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: UseCaseTemplate[];
  onToggleTemplate: (id: string) => void;
}

export const WorkspaceTemplatesModal: React.FC<WorkspaceTemplatesModalProps> = ({
  isOpen,
  onClose,
  templates,
  onToggleTemplate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900">Templates</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Title */}
        <div className="px-6 pt-4 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">USE CASES</span>
        </div>

        {/* List of Use Cases */}
        <div className="px-3 pb-4 max-h-[420px] overflow-y-auto custom-scrollbar space-y-1">
          {templates.map(tmpl => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => onToggleTemplate(tmpl.id)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border border-slate-200/60 ${tmpl.colorBg} ${tmpl.colorIcon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                </div>

                {/* Checkbox circle matching user screenshot */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  tmpl.enabled ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                }`}>
                  {tmpl.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer matching user screenshot */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-start gap-2 text-[11px] text-slate-400 font-semibold">
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↑</kbd>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↓</kbd>
          <span>Navigate</span>
        </div>

      </div>
    </div>
  );
};
