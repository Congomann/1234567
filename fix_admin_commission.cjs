const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the old static commission block I added
const oldCommissionBlock = `                                {formData.role === UserRole.ADVISOR && (
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

if(content.includes(oldCommissionBlock)) {
    content = content.replace(oldCommissionBlock, "");
}

// 2. Insert dynamic category and commission blocks
const dynamicBlock = `                                {formData.role === UserRole.ADVISOR && (
                                    <>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.category} onChange={e => {
                                            const newCat = e.target.value;
                                            let defaultLevel = 65;
                                            if (newCat === 'Real Estate') defaultLevel = 50;
                                            if (newCat === 'Mortgage & Lending') defaultLevel = 100;
                                            if (newCat === 'Securities') defaultLevel = 35;
                                            
                                            setFormData({ ...formData, category: newCat as any, contractLevel: defaultLevel });
                                        }}>
                                            <option value="Insurance & General">Insurance & General</option>
                                            <option value="Real Estate">Real Estate</option>
                                            <option value="Mortgage & Lending">Mortgage & Lending</option>
                                            <option value="Securities">Securities</option>
                                            <option value="Logistics">Logistics</option>
                                        </select>
                                        
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Initial Commission Level</label>
                                            <select 
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3" 
                                                value={formData.contractLevel} 
                                                onChange={e => setFormData({ ...formData, contractLevel: Number(e.target.value) })}
                                            >
                                                {formData.category === 'Real Estate' ? (
                                                    <>
                                                        <option value={50}>50% (Broker Split)</option>
                                                        <option value={70}>70% (Standard Split)</option>
                                                        <option value={85}>85% (Top Producer)</option>
                                                    </>
                                                ) : formData.category === 'Mortgage & Lending' ? (
                                                    <>
                                                        <option value={100}>100 bps (Standard)</option>
                                                        <option value={150}>150 bps (Experienced)</option>
                                                        <option value={200}>200 bps (Senior)</option>
                                                    </>
                                                ) : formData.category === 'Securities' ? (
                                                    <>
                                                        <option value={35}>35% (Payout Grid)</option>
                                                        <option value={50}>50% (Experienced Payout)</option>
                                                        <option value={70}>70% (Senior Payout)</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value={65}>65% (Standard)</option>
                                                        <option value={85}>85% (Experienced)</option>
                                                        <option value={100}>100% (Senior)</option>
                                                    </>
                                                )}
                                            </select>
                                            
                                            <div className="flex items-start gap-2 text-[10px] text-blue-600 bg-blue-100/50 p-3 rounded-lg leading-relaxed font-semibold">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                <p>
                                                {formData.category === 'Real Estate' ? 
                                                    "Real Estate advisors start with a baseline broker split. This applies to residential and commercial real estate commissions." :
                                                 formData.category === 'Mortgage & Lending' ?
                                                    "Mortgage loan officers are compensated based on basis points (bps) of the total loan amount originated." :
                                                 formData.category === 'Securities' ?
                                                    "Securities and Wealth Management advisors receive payouts based on Assets Under Management (AUM) and advisory fees." :
                                                    "Performance Bonus: If this advisor brings 40 business deals for Whole Life products, their commission percentage will automatically bump by 15%."
                                                }
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}`;

const selectTarget = `<select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}>
                                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>`;
content = content.replace(selectTarget, selectTarget + "\n" + dynamicBlock);

fs.writeFileSync(path, content);
