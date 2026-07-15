import React, { useState } from 'react';
import { Bot, Play, Square } from 'lucide-react';

export const AgentManager: React.FC = () => {
    const [status, setStatus] = useState<'offline' | 'running' | 'sleeping'>('offline');
    const [task, setTask] = useState<string>('Awaiting instructions...');

    const wakeUpAgent = async () => {
        setStatus('running');
        setTask('Initializing Neural Network...');
        setTimeout(() => {
            setTask('Monitoring inbound data streams...');
        }, 2000);
    };

    const shutdownAgent = () => {
        setStatus('offline');
        setTask('System offline.');
    };

    return (
        <div className="bg-[#1E293B] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border border-slate-700 mb-12 flex flex-col md:flex-row items-center justify-between">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none transform group-hover:scale-110 transition-transform duration-[5s] flex items-center justify-center">
                <Bot size={400} />
            </div>

            <div className="relative z-10 flex items-center gap-8 mb-8 md:mb-0">
                <div className={`p-8 rounded-[2.5rem] shadow-xl ${status === 'running' ? 'bg-blue-600 animate-pulse' : 'bg-slate-700'}`}>
                    <Bot size={48} className={status === 'running' ? 'text-white' : 'text-slate-400'} />
                </div>
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Agent Manager</h2>
                    <div className="flex items-center gap-4">
                        <span className={`flex h-3 w-3 relative`}>
                            {status === 'running' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'running' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Status: <span className={status === 'running' ? 'text-green-400' : 'text-rose-400'}>{status}</span>
                        </span>
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-300">Current Task: {task}</p>
                </div>
            </div>

            <div className="relative z-10 flex gap-4">
                 {status !== 'running' ? (
                     <button
                        onClick={wakeUpAgent}
                        className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all flex items-center gap-4 active:scale-95"
                     >
                         <Play size={18} /> Wake Up
                     </button>
                 ) : (
                     <button
                        onClick={shutdownAgent}
                        className="px-12 py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_10px_30px_rgba(225,29,72,0.4)] transition-all flex items-center gap-4 active:scale-95"
                     >
                         <Square size={18} /> Standby
                     </button>
                 )}
            </div>
        </div>
    );
};
