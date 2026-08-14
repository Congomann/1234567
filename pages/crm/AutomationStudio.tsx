import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
    Zap,
    Clock,
    Cpu,
    Layers,
    Activity,
    X,
    Plus,
    ChevronRight,
    ShieldCheck,
    Pause,
    Play,
    PlayCircle,
    Trash2,
    Loader2,
    CheckCircle2,
    ChevronDown,
    Database,
    Share2,
    MessageCircle
} from 'lucide-react';
import { Workflow, WorkflowTrigger } from '../../types';
import { AgentManager } from '../../components/agents/AgentManager';

export const AutomationStudio: React.FC = () => {
    const { automationMetrics, workflows, addWorkflow, toggleWorkflow, processingLeads, leads, triggerPulse } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentSuccess, setDeploymentSuccess] = useState(false);

    // Architect State
    const [wfName, setWfName] = useState('');
    const [wfTrigger, setWfTrigger] = useState<WorkflowTrigger>(WorkflowTrigger.LEAD_INGESTION);
    const [wfActions, setWfActions] = useState<string[]>([]);
    const [newActionText, setNewActionText] = useState('');

    const handleInsertAction = () => {
        if (newActionText.trim()) {
            setWfActions(prev => [...prev, newActionText.trim().toUpperCase()]);
            setNewActionText('');
        }
    };

    const handleRemoveAction = (idx: number) => {
        setWfActions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleDeploy = async () => {
        if (!wfName.trim() || wfActions.length === 0) {
            alert("Workflow must have a name and at least one action nodes.");
            return;
        }

        setIsDeploying(true);
        
        try {
            const response = await fetch('/api/marketing/automations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: wfName,
                    trigger: wfTrigger,
                    actions: wfActions
                })
            });
            
            if (response.ok) {
                // Keep the local state sync for immediate UI updates
                addWorkflow({
                    name: wfName,
                    trigger: wfTrigger,
                    actions: wfActions,
                    description: `Automatic path triggered by ${wfTrigger} executing ${wfActions.length} system nodes.`,
                    impact: 'HIGH',
                    category: wfTrigger.includes('SOCIAL') ? 'SOCIAL AUTOMATION' : 'LEAD NURTURE'
                });

                setDeploymentSuccess(true);
                setTimeout(() => {
                    setWfName('');
                    setWfTrigger(WorkflowTrigger.LEAD_INGESTION);
                    setWfActions([]);
                    setDeploymentSuccess(false);
                    setIsModalOpen(false);
                }, 1500);
            } else {
                alert('Failed to deploy workflow to production.');
            }
        } catch (err) {
            console.error('Deployment error:', err);
            alert('Failed to deploy workflow. Backend unreachable.');
        } finally {
            setIsDeploying(false);
        }
    };

    const MetricCard = ({ icon: Icon, value, label, iconBg }: any) => (
        <div className="bg-white/60 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-white/60 flex items-center gap-10 flex-1 transition-all hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <Icon size={120} />
            </div>
            <div className={`relative z-10 h-24 w-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-500 ${iconBg}`}>
                <Icon size={44} />
            </div>
            <div className="relative z-10">
                <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-2 drop-shadow-sm">{value}</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 animate-in fade-in duration-700 font-sans min-h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                            <Zap size={18} className="text-white fill-white" />
                        </div>
                        <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Automation Studio Pro</h2>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Logic Engine</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-white/80 p-3 rounded-full border border-slate-100 shadow-sm flex items-center gap-4 px-8 backdrop-blur-md">
                        <div className={`h-3 w-3 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.6)] ${processingLeads.length > 0 ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">System Status: <span className={processingLeads.length > 0 ? 'text-blue-600 font-black' : 'text-emerald-600 font-black'}>{processingLeads.length > 0 ? 'Processing Lead' : 'Operational'}</span></span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgb(15,23,42,0.3)] hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-3 active:scale-95 duration-300"
                    >
                        <Plus size={18} strokeWidth={4} /> Define Workflow
                    </button>
                </div>
            </div>

            {/* Live Monitor Strip */}
            {processingLeads.length > 0 && (
                <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between animate-in slide-in-from-top-4 px-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]"><Zap size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest leading-none mb-1">Live Automation Stream</p>
                            <p className="text-sm font-bold text-white">Processing: <span className="text-blue-300">{leads.find(l => l.id === processingLeads[0].leadId)?.name || 'Incoming Signal...'}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-10 relative z-10 mt-4 md:mt-0">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Step:</span>
                            <span className="text-xs font-black text-white uppercase tracking-widest bg-blue-600 px-4 py-1.5 rounded-full shadow-lg animate-pulse">{processingLeads[0].activeNode}</span>
                        </div>
                        <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    </div>
                </div>
            )}

            {/* Main Metrics */}
            <div className="flex flex-col xl:flex-row gap-8">
                <MetricCard
                    icon={Cpu}
                    value={automationMetrics?.executions.toLocaleString() || 0}
                    label="Workflow Executions"
                    iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <MetricCard
                    icon={Clock}
                    value={`${Math.floor((automationMetrics?.bandwidthSaved || 0) / 60)}h+`}
                    label="Human Bandwidth Saved"
                    iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600"
                />
                <MetricCard
                    icon={Share2}
                    value="1.2k"
                    label="Social Interactions"
                    iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
                />
            </div>

            {/* Agent Manager Panel */}
            <AgentManager />

            {/* Workflow Engine Cards */}
            <div className="space-y-12">
                {workflows.map((wf) => {
                    const isWfProcessing = processingLeads.length > 0 && processingLeads.some(p => p.activeNode === wf.actions[0] || wf.actions.includes(p.activeNode));
                    const isSocial = wf.trigger?.includes('SOCIAL');

                    return (
                        <div key={wf.id} className={`bg-white/60 backdrop-blur-xl rounded-[4rem] border shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden p-10 lg:p-16 group relative transition-all duration-500 hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)] ${isWfProcessing ? 'border-blue-400 ring-4 ring-blue-50' : 'border-white/60'}`}>
                            {isWfProcessing && (
                                <div className="absolute top-0 right-0 p-12">
                                    <span className="flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${isSocial ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30' : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/30'}`}>
                                            {wf.impact} PRIORITY
                                        </span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm">
                                            {isSocial ? <MessageCircle size={14} className="text-purple-600" /> : <Layers size={14} className="text-blue-600" />} {wf.category}
                                        </span>
                                    </div>
                                    <h3 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">{wf.name}</h3>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">{wf.description}</p>
                                </div>

                                <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 flex-shrink-0 w-full xl:w-[600px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                        <Zap size={300} className="text-white" />
                                    </div>

                                    <div className="flex items-center justify-between mb-10">
                                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-3 bg-blue-900/30 px-4 py-2 rounded-full border border-blue-500/20">
                                            <Database size={14} className="text-blue-400" /> Pipeline Chain Path
                                        </h4>
                                        <Activity size={18} className={`text-blue-400 ${isWfProcessing ? 'animate-pulse text-blue-300' : ''}`} />
                                    </div>

                                    <div className="space-y-12 relative z-10">
                                        <div className="flex items-center gap-5 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                            <div className={`w-4 h-4 rounded-full ${isWfProcessing ? 'bg-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.9)] animate-ping' : 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]'}`}></div>
                                            <span className={`text-sm font-black uppercase tracking-widest ${isWfProcessing ? 'text-blue-300' : 'text-slate-200'}`}>{wf.trigger}</span>
                                        </div>

                                        <div className="flex items-center justify-start gap-4 relative overflow-x-auto hide-scrollbar pb-4">
                                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-slate-800 -z-10 mx-6"></div>

                                            {wf.actions.map((act, i) => {
                                                const isStepActive = isWfProcessing && processingLeads.some(p => p.activeNode === act);
                                                return (
                                                    <React.Fragment key={i}>
                                                        <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center min-w-[140px] shrink-0 transform transition-all duration-500 ${isStepActive
                                                                ? 'bg-blue-600 scale-105 ring-4 ring-blue-500/30 text-white'
                                                                : 'bg-slate-800 border border-slate-700 text-slate-300 opacity-80 hover:opacity-100'
                                                            }`}>
                                                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{act}</span>
                                                            {isStepActive && <Loader2 size={12} className="ml-3 animate-spin text-white" />}
                                                        </div>
                                                        {i < wf.actions.length - 1 && (
                                                            <ChevronRight size={20} className={`shrink-0 transition-colors ${isStepActive ? 'text-blue-400' : 'text-slate-600'}`} />
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-8 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                                    <div className="text-right">
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{wf.executionsYTD.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Instance Cycles</p>
                                    </div>
                                    <button
                                        onClick={() => toggleWorkflow(wf.id)}
                                        className={`p-5 rounded-[2rem] transition-all shadow-xl active:scale-95 flex items-center justify-center transform hover:scale-105 ${wf.status === 'active' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                                    >
                                        {wf.status === 'active' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Global Sync Section */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0F172A] p-16 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-slate-800">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none transform group-hover:scale-110 transition-transform duration-[5s]">
                    <Zap size={600} strokeWidth={1} />
                </div>

                <div className="relative z-10 space-y-6 text-center md:text-left max-w-2xl">
                    <div className="inline-flex items-center gap-3 bg-blue-500/20 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/30 shadow-sm backdrop-blur-md">
                        <ShieldCheck size={14} className="animate-pulse" /> Global System Sync
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none">Trigger Logic Pulse</h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">Instantly recalibrate all pipeline nodes and social media agents across the terminal to resolve high-priority items.</p>
                </div>
                <div className="relative z-10 mt-10 md:mt-0">
                    <button
                        onClick={triggerPulse}
                        className="px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all flex items-center gap-4 transform hover:scale-105 active:scale-95"
                    >
                        Sync System <Activity size={20} />
                    </button>
                </div>
            </div>

            {/* Workflow Architect Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xl p-6 animate-in fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl w-full max-w-5xl p-12 md:p-16 relative border border-white/60 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={isDeploying}
                            className="absolute top-8 right-8 p-4 bg-slate-100/80 hover:bg-slate-200 rounded-full text-slate-500 transition-all disabled:opacity-50"
                        >
                            <X size={24} />
                        </button>

                        {deploymentSuccess ? (
                            <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                                <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                                    <CheckCircle2 size={64} />
                                </div>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase">Operational</h2>
                                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-4">Logic sequence has been provisioned to the cluster.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[2rem] shadow-xl shadow-blue-500/30">
                                        <Zap size={36} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Workflow Architect</h2>
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Configure Automated Workflow Path</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Workflow Name</label>
                                            <input
                                                className="w-full bg-slate-50/80 border-2 border-slate-100 focus:border-blue-500 rounded-3xl px-6 py-5 text-sm font-bold text-slate-900 outline-none transition-all shadow-inner backdrop-blur-sm"
                                                placeholder="e.g. Meta Lead Sync"
                                                value={wfName}
                                                disabled={isDeploying}
                                                onChange={e => setWfName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Trigger Event</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-slate-50/80 border-2 border-slate-100 focus:border-blue-500 rounded-3xl px-6 py-5 text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer shadow-inner backdrop-blur-sm transition-all"
                                                    value={wfTrigger}
                                                    disabled={isDeploying}
                                                    onChange={e => setWfTrigger(e.target.value as WorkflowTrigger)}
                                                >
                                                    {Object.values(WorkflowTrigger).map(trigger => (
                                                        <option key={trigger} value={trigger}>{trigger}</option>
                                                    ))}
                                                    <option value="SOCIAL_MENTION_DETECTED">SOCIAL_MENTION_DETECTED</option>
                                                    <option value="AD_CLICK_CONVERSION">AD_CLICK_CONVERSION</option>
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Action Sequence</label>
                                        <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 shadow-inner min-h-[300px] flex flex-col border border-slate-800">
                                            <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                                                        <PlayCircle size={16} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Start Path</span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-500" />
                                            </div>

                                            {wfActions.map((action, idx) => (
                                                <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-bottom-2">
                                                    <div className="flex-1 flex items-center justify-between p-4 bg-slate-800/80 rounded-2xl border border-blue-500/30 shadow-lg border-l-4 border-l-blue-500">
                                                        <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">{action}</span>
                                                        <button
                                                            disabled={isDeploying}
                                                            onClick={() => handleRemoveAction(idx)}
                                                            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    {idx < wfActions.length - 1 && <ChevronRight size={16} className="text-slate-600" />}
                                                </div>
                                            ))}

                                            {!isDeploying && (
                                                <div className="mt-auto space-y-3 pt-6 border-t border-slate-800/50">
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner transition-all"
                                                            placeholder="Enter system action..."
                                                            value={newActionText}
                                                            onChange={e => setNewActionText(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handleInsertAction()}
                                                        />
                                                        <button
                                                            onClick={handleInsertAction}
                                                            className="px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all shadow-md active:scale-95 flex items-center justify-center"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 flex gap-4 md:gap-6 mt-8">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isDeploying}
                                        className="flex-1 py-5 rounded-full font-black text-[10px] bg-slate-100 text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Discard Draft
                                    </button>
                                    <button
                                        onClick={handleDeploy}
                                        disabled={isDeploying || wfActions.length === 0}
                                        className="flex-[2] py-5 rounded-full font-black text-[10px] bg-slate-900 text-white uppercase tracking-widest hover:bg-slate-800 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isDeploying ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> Provisioning...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={16} className="fill-current text-blue-400" /> Deploy to Production
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
