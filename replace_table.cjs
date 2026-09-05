const fs = require('fs');

let file = fs.readFileSync('pages/crm/Clients.tsx', 'utf8');

const startStr = '<table className="w-full text-left">';
const endStr = '</table>';

const startIndex = file.indexOf(startStr);
const endIndex = file.indexOf(endStr, startIndex) + endStr.length;

const replacement = `                <div className="space-y-4">
                    {/* Header Row of Boxes with Specific Request Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <div className="bg-[#A8DADC] p-4 rounded-t-3xl md:rounded-3xl border border-[#90C4C6] text-center shadow-sm">
                            <span className="text-[10px] font-black text-[#1D3557] uppercase tracking-[0.2em]">Client</span>
                        </div>
                        <div className="bg-blue-500 p-4 md:rounded-3xl border border-blue-600 text-center shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Carrier</span>
                        </div>
                        <div className="bg-indigo-500 p-4 md:rounded-3xl border border-indigo-600 text-center shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Policy / Quote #</span>
                        </div>
                        <div className="bg-yellow-400 p-4 md:rounded-3xl border border-yellow-500 text-center shadow-sm">
                            <span className="text-[10px] font-black text-yellow-900 uppercase tracking-[0.2em]">Est. Premium</span>
                        </div>
                        <div className="bg-slate-700 p-4 md:rounded-3xl border border-slate-800 text-center shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</span>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-b-3xl md:rounded-3xl border border-slate-200 text-center shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</span>
                        </div>
                    </div>

                    {/* Data Rows */}
                    {filteredClients.map(client => {
                        const status = getStatusText(client.renewalDate);
                        const isActiveStatus = status === 'Active';
                        const isInactiveStatus = status === 'Expired';
                        
                        return (
                            <div key={client.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 group cursor-pointer" onClick={() => handleEdit(client, 'info')}>
                                {/* Client Column */}
                                <div className="bg-[#A8DADC]/10 p-6 rounded-3xl border border-[#A8DADC]/30 flex flex-col justify-center text-center md:text-left transition-all group-hover:bg-[#A8DADC]/20">
                                    <div className="font-black text-slate-900 text-sm">{client.name}</div>
                                    <span className="text-[9px] text-[#457B9D] font-black uppercase tracking-tighter mt-1">{client.product}</span>
                                </div>
                                
                                {/* Carrier Column */}
                                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-center transition-all group-hover:bg-blue-100/50" onClick={(e) => { e.stopPropagation(); handleEdit(client, 'carrier_policy'); }}>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-black text-blue-700 uppercase tracking-tight text-center">{client.carrier || 'Pending'}</span>
                                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[8px] font-mono font-bold">API SYNC</span>
                                    </div>
                                </div>
                                
                                {/* Policy Column */}
                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-center transition-all group-hover:bg-indigo-100/50">
                                    <span className="text-xs font-mono font-black text-indigo-700 tracking-wider">{client.policyNumber}</span>
                                </div>
                                
                                {/* Premium Column */}
                                <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 flex items-center justify-center transition-all group-hover:bg-yellow-100">
                                    <span className="text-sm font-black text-yellow-700">$\\u007Bclient.premium.toLocaleString()\\u007D</span>
                                </div>
                                
                                {/* Status Column */}
                                <div className={\`p-6 rounded-3xl border flex items-center justify-center transition-all \${isActiveStatus ? 'bg-green-50 border-green-100 group-hover:bg-green-100' : isInactiveStatus ? 'bg-red-50 border-red-100 group-hover:bg-red-100' : 'bg-orange-50 border-orange-100 group-hover:bg-orange-100'}\`}>
                                    <span className={\`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest \${isActiveStatus ? 'bg-green-600 text-white shadow-sm' : isInactiveStatus ? 'bg-red-600 text-white shadow-sm' : 'bg-orange-500 text-white shadow-sm'}\`}>
                                        {status}
                                    </span>
                                </div>
                                
                                {/* Actions Column */}
                                <div className="bg-slate-50/30 p-4 rounded-3xl border border-slate-100 flex items-center justify-center gap-2 transition-all group-hover:bg-white" onClick={(e) => e.stopPropagation()}>
                                    {client.email && (
                                        <a href={\`mailto:\\u0024\\u007Bclient.email\\u007D\`} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm">
                                            <Mail className="h-4 w-4" />
                                        </a>
                                    )}
                                    {client.phone && (
                                        <a href={\`tel:\\u0024\\u007Bclient.phone\\u007D\`} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm">
                                            <Phone className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredClients.length === 0 && (
                        <div className="py-32 text-center">
                            <div className="flex flex-col items-center justify-center opacity-10">
                                <Shield className="h-32 w-32 mb-6" strokeWidth={1} />
                                <h2 className="text-4xl font-black uppercase tracking-[0.4em]">Database Empty</h2>
                            </div>
                        </div>
                    )}
                </div>`;

if(startIndex > -1) {
  file = file.slice(0, startIndex) + replacement + file.slice(endIndex);
  fs.writeFileSync('pages/crm/Clients.tsx', file);
  console.log("Successfully replaced table with grid!");
} else {
  console.log("Could not find table!");
}
