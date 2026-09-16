const fs = require('fs');
let content = fs.readFileSync('pages/crm/insurance/InsurancePages.tsx', 'utf8');

// 1. Add lucide icons for timeline
if (!content.includes('Activity')) {
    content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Activity, CheckCircle2, Clock, AlertTriangle, CreditCard, FileSignature, X } from 'lucide-react';");
}

// 2. Add state for the tracking modal
const componentStart = `export const PoliciesApps: React.FC = () => {
    const { applications, updateApplicationStatus, user } = useData();`;
    
const newComponentStart = `export const PoliciesApps: React.FC = () => {
    const { applications, updateApplicationStatus, user } = useData();
    const [trackingModalApp, setTrackingModalApp] = React.useState<any>(null);
    
    // Generate mock timeline based on status
    const generateTimeline = (status: string) => {
        const events = [
            { id: 1, title: 'Application Submitted', date: '2026-09-01T10:00:00Z', icon: FileSignature, color: 'text-blue-500', bg: 'bg-blue-100', completed: true },
        ];
        
        if (['Underwriting', 'Approved', 'Issued', 'Active'].includes(status)) {
            events.push({ id: 2, title: 'Carrier Received Application', date: '2026-09-02T14:30:00Z', icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-100', completed: true });
        }
        
        if (['Approved', 'Issued', 'Active'].includes(status)) {
            events.push({ id: 3, title: 'Underwriting Approved', date: '2026-09-05T09:15:00Z', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100', completed: true });
            events.push({ id: 4, title: 'Initial Payment Processed', date: '2026-09-06T11:20:00Z', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-100', completed: true });
            events.push({ id: 5, title: 'Policy Active & In-Force', date: '2026-09-07T08:00:00Z', icon: Activity, color: 'text-green-500', bg: 'bg-green-100', completed: true });
        } else if (status === 'Pending') {
            events.push({ id: 2, title: 'Awaiting Signatures', date: 'Pending', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100', completed: false });
        } else if (status === 'Underwriting') {
            events.push({ id: 3, title: 'Underwriting Review', date: 'In Progress', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100', completed: false });
            events.push({ id: 4, title: 'Medical Exam Required', date: 'Pending Client Action', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100', completed: false });
        }
        
        if (['Lapsed', 'Expired'].includes(status)) {
            events.push({ id: 3, title: 'Payment Missed (Grace Period)', date: '2026-10-01T12:00:00Z', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100', completed: true });
            events.push({ id: 4, title: 'Policy Lapsed', date: '2026-11-01T00:00:00Z', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100', completed: true });
        }
        return events;
    };`;

if (!content.includes('trackingModalApp')) {
    content = content.replace(componentStart, newComponentStart);
}

// 3. Update the button
const oldButton = `<button onClick={() => alert('Feature in development')} className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">
                                        Details
                                    </button>`;
const newButton = `<button onClick={() => setTrackingModalApp(app)} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm flex items-center justify-center gap-1">
                                        <Activity size={12} /> Track
                                    </button>`;
content = content.replace(oldButton, newButton);

// 4. Inject Modal HTML at the end of PoliciesApps return block
const returnEnd = `</div>
        </div>
    );
};`;
const modalHTML = `
            {/* Tracking Modal */}
            {trackingModalApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-indigo-900 p-6 relative">
                            <button onClick={() => setTrackingModalApp(null)} className="absolute top-4 right-4 text-indigo-200 hover:text-white transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-white mb-1">Policy Tracker</h2>
                            <p className="text-indigo-200 text-sm font-medium">Carrier API Sync: {trackingModalApp.carrier}</p>
                            
                            <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Client</div>
                                        <div className="text-white font-medium">{trackingModalApp.clientName}</div>
                                    </div>
                                    <div>
                                        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Policy Number</div>
                                        <div className="text-white font-medium">{trackingModalApp.policyNumber || 'Pending Issuance'}</div>
                                    </div>
                                    <div>
                                        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Premium</div>
                                        <div className="text-white font-medium">\\$\\{trackingModalApp.premiumAmount || 'TBD'\\} \\{trackingModalApp.premiumFrequency\\}</div>
                                    </div>
                                    <div>
                                        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Current Status</div>
                                        <div className="text-white font-medium">{trackingModalApp.status}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Activity Feed</h3>
                            
                            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                                {generateTimeline(trackingModalApp.status).map((event: any) => {
                                    const Icon = event.icon;
                                    return (
                                        <div key={event.id} className="relative pl-6">
                                            <div className={\`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm \${event.bg} \${event.color}\`}>
                                                <Icon size={14} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className={\`font-bold \${event.completed ? 'text-slate-900' : 'text-slate-500'}\`}>{event.title}</h4>
                                                <p className="text-xs font-medium text-slate-400 mt-1">
                                                    {event.completed && event.date !== 'Pending' && event.date !== 'In Progress' && event.date !== 'Pending Client Action'
                                                        ? new Date(event.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                                                        : event.date}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                            <span className="flex items-center"><Activity size={12} className="mr-1" /> Live Sync Active</span>
                            <span>Data provided by Carrier API</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};`;
if (!content.includes('trackingModalApp &&')) {
    content = content.replace(returnEnd, modalHTML);
}

fs.writeFileSync('pages/crm/insurance/InsurancePages.tsx', content);
console.log('Patched InsurancePages.tsx with tracking modal');
