const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

const selectStart = `<select \n                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3" \n                                                value={formData.contractLevel} \n                                                onChange={e => setFormData({ ...formData, contractLevel: Number(e.target.value) })}\n                                            >`;
// This won't work well due to exact spacing. Let's use substring replacement.

const startIndex = content.indexOf('<select \n                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3"');
const endIndex = content.indexOf('</select>', startIndex) + '</select>'.length;

const newInput = `<div className="relative mb-3">
                                                <input 
                                                    type="number"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold pr-16 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    value={formData.contractLevel}
                                                    onChange={e => setFormData({ ...formData, contractLevel: Number(e.target.value) })}
                                                    placeholder="e.g. 65"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs tracking-wider">
                                                    {formData.category === 'Mortgage & Lending' ? 'BPS' : '%'}
                                                </div>
                                            </div>`;

if (startIndex !== -1 && endIndex > startIndex) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    content = before + newInput + after;
    fs.writeFileSync(path, content);
    console.log("Input patched successfully.");
} else {
    console.log("Could not find the select block. StartIndex:", startIndex);
}
