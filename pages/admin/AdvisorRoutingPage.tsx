import React, { useState, useEffect } from 'react';
import { Network, Search, UserCheck, Activity, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AdvisorRoutingPage() {
    const { allUsers } = useData();
    const [advisors, setAdvisors] = useState<any[]>([]);
    const [leadTypes] = useState([
        { id: '1', name: 'Life Insurance' },
        { id: '2', name: 'Mortgage' },
        { id: '3', name: 'Real Estate' },
        { id: '4', name: 'Securities' }
    ]);
    const [specialties, setSpecialties] = useState<Record<string, string[]>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Mock connecting to the DB routing_state
        const activeAdvisors = allUsers.filter(u => u.role === 'Advisor' || u.role === 'Manager');
        setAdvisors(activeAdvisors);
        
        // Mock loading specialties map
        const defaultMocks: Record<string, string[]> = {};
        activeAdvisors.forEach(a => {
            defaultMocks[a.id] = ['1']; // Give everyone Life Insurane default for mock
        });
        setSpecialties(defaultMocks);
    }, [allUsers]);

    const toggleSpecialty = (advisorId: string, typeId: string) => {
        setSpecialties(prev => {
            const current = prev[advisorId] || [];
            if (current.includes(typeId)) {
                return { ...prev, [advisorId]: current.filter(id => id !== typeId) };
            } else {
                return { ...prev, [advisorId]: [...current, typeId] };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save delay
        await new Promise(res => setTimeout(res, 1000));
        setIsSaving(false);
        alert('Routing specialties updated! Round robin engine will respect these new flags.');
    };

    return (
        <div className="p-8 pb-32 animate-fade-in max-w-7xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Network size={20} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Lead Routing</h1>
                </div>
                <p className="text-slate-500 font-medium ml-14">
                    Manage Advisor specialities for Automatic Round-Robin webhooks.
                </p>
            </header>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Search advisors..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 w-64"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="btn-primary py-2 px-6 rounded-xl flex items-center gap-2 text-sm shadow-xl shadow-blue-500/20"
                    >
                        {isSaving ? <Activity className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Routing Rules
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-1/4">
                                    Advisor Name
                                </th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-1/4">
                                    Status
                                </th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    Specialty Matrix (Round Robin Eligibility)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {advisors.map(adv => (
                                <tr key={adv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {adv.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{adv.name}</div>
                                                <div className="text-xs text-slate-500">{adv.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Active
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {leadTypes.map(type => {
                                                const isActive = (specialties[adv.id] || []).includes(type.id);
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => toggleSpecialty(adv.id, type.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                            isActive 
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        {type.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {advisors.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center border-t border-slate-100">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <UserCheck size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">No Eligible Advisors Found</h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                                Create an advisor account in the Users dashboard to assign lead routing rules.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
