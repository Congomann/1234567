const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update initial form data to include contractLevel
const initialTarget = "const initialFormData = { name: '', email: '', password: '', role: UserRole.ADVISOR };";
const initialStr = "const initialFormData = { name: '', email: '', password: '', role: UserRole.ADVISOR, contractLevel: 70 };";
if(content.includes(initialTarget)) {
    content = content.replace(initialTarget, initialStr);
} else {
    // try finding just the structure
    content = content.replace(/name: '', email: '', password: '', role: UserRole\.ADVISOR/, "name: '', email: '', password: '', role: UserRole.ADVISOR, contractLevel: 70");
}

// Add the commission dropdown and the note
const formFieldTarget = `<select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}>
                                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>`;
const formFieldStr = `<select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}>
                                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                
                                {formData.role === UserRole.ADVISOR && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Initial Commission Level</label>
                                        <select 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3" 
                                            value={formData.contractLevel} 
                                            onChange={e => setFormData({ ...formData, contractLevel: Number(e.target.value) })}
                                        >
                                            <option value={70}>70% (Standard)</option>
                                            <option value={85}>85% (Experienced)</option>
                                            <option value={100}>100% (Senior)</option>
                                        </select>
                                        
                                        <div className="flex items-start gap-2 text-[10px] text-blue-600 bg-blue-100/50 p-3 rounded-lg leading-relaxed font-semibold">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                            <p>Performance Bonus: If this advisor brings 40 business deals for Whole Life products, their commission percentage will automatically bump by 15%.</p>
                                        </div>
                                    </div>
                                )}`;
content = content.replace(formFieldTarget, formFieldStr);

fs.writeFileSync(path, content);
