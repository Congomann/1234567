const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

const ctxTarget = "const { user, allUsers, updateUser, addAdvisor, permanentlyDeleteUser } = useData();";
const ctxStr = "const { user, allUsers, updateUser, addAdvisor, inviteAdvisor, permanentlyDeleteUser } = useData();";
content = content.replace(ctxTarget, ctxStr);

const handleTarget = `    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            addAdvisor(formData as User);
            setIsModalOpen(false);
            setFormData(initialFormData);
        }
    };`;
const handleStr = `    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            try {
                await inviteAdvisor(formData as User);
                setIsModalOpen(false);
                setFormData(initialFormData);
                alert('Invite sent successfully!');
            } catch (err: any) {
                alert(err.message || 'Failed to send invite');
            }
        }
    };`;
content = content.replace(handleTarget, handleStr);

const passField = `<input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" type="password" placeholder="Initial Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />`;
content = content.replace(passField, ""); // Remove it

const titleTarget = `<h2 className="text-2xl font-black text-[#0B2240] mb-8 tracking-tight">Provision New User</h2>`;
const titleStr = `<h2 className="text-2xl font-black text-[#0B2240] mb-8 tracking-tight">Invite New Advisor</h2>`;
content = content.replace(titleTarget, titleStr);

const btnTarget = `<button type="submit" className="flex-1 py-4 bg-[#0B2240] text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-blue-900/20">Add User</button>`;
const btnStr = `<button type="submit" className="flex-1 py-4 bg-[#0B2240] text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-blue-900/20">Send Invite Email</button>`;
content = content.replace(btnTarget, btnStr);

fs.writeFileSync(path, content);
