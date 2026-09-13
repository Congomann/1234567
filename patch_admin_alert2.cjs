const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    const handleAddUser = async (e: React.FormEvent) => {
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

const replacement = `    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            try {
                const res = await inviteAdvisor(formData as User);
                setIsModalOpen(false);
                setFormData(initialFormData);
                
                if (res && res.emailError) {
                    alert('User created, but welcome email failed (SMTP Auth Error).\\n\\nYou can share this manual invite link with the advisor:\\n' + window.location.origin + '/onboarding/setup?token=' + res.user.invite_token);
                } else {
                    alert('Invite sent successfully!');
                }
            } catch (err: any) {
                alert(err.message || 'Failed to send invite');
            }
        }
    };`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
