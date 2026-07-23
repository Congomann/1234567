import React from 'react';
import { CheckCircle2, Circle, X, TrendingUp, Shield, Building2, Landmark, Truck, Phone, Zap, Scale, Users, Award } from 'lucide-react';

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  enabled: boolean;
}

interface WorkspaceTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledModules: Record<string, boolean>;
  onToggleModule: (id: string) => void;
}

export const WorkspaceTemplateModal: React.FC<WorkspaceTemplateModalProps> = ({
  isOpen,
  onClose,
  enabledModules,
  onToggleModule
}) => {
  if (!isOpen) return null;

  const modules: TemplateOption[] = [
    { id: 'sales', name: 'Sales & Leads DB', category: 'Core CRM', icon: Zap, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', enabled: enabledModules['sales'] ?? true },
    { id: 'securities', name: 'Securities & Investing', category: 'Wealth Advisory', icon: TrendingUp, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', enabled: enabledModules['securities'] ?? true },
    { id: 'recruiting', name: 'Advisor Recruiting & Onboarding', category: 'Growth', icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', enabled: enabledModules['recruiting'] ?? true },
    { id: 'marketing', name: 'Marketing & Ad Campaigns', category: 'Acquisition', icon: Award, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', enabled: enabledModules['marketing'] ?? true },
    { id: 'telephony', name: 'Telephony & AI Voice Suite', category: 'Communications', icon: Phone, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', enabled: enabledModules['telephony'] ?? true },
    { id: 'real_estate', name: 'Real Estate & Escrow', category: 'Property', icon: Building2, iconBg: 'bg-rose-100', iconColor: 'text-rose-600', enabled: enabledModules['real_estate'] ?? true },
    { id: 'mortgage', name: 'Mortgage & Loan Origination', category: 'Lending', icon: Landmark, iconBg: 'bg-teal-100', iconColor: 'text-teal-600', enabled: enabledModules['mortgage'] ?? true },
    { id: 'logistics', name: 'Logistics & Fleet Command', category: 'Freight', icon: Truck, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', enabled: enabledModules['logistics'] ?? true },
    { id: 'legal', name: 'Legal & Compliance Vault', category: 'Governance', icon: Scale, iconBg: 'bg-slate-100', iconColor: 'text-slate-700', enabled: enabledModules['legal'] ?? true },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Templates / Use Cases</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Customize your active CRM sidebar modules</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modules List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">USE CASES</span>

          <div className="space-y-2">
            {modules.map(mod => {
              const Icon = mod.icon;
              const isChecked = mod.enabled;
              return (
                <div
                  key={mod.id}
                  onClick={() => onToggleModule(mod.id)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${mod.iconBg} ${mod.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{mod.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{mod.category}</span>
                    </div>
                  </div>

                  <div>
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600 stroke-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">↑</span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">↓</span>
            <span>Navigate</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/20"
          >
            Apply Layout
          </button>
        </div>

      </div>
    </div>
  );
};
