const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `            if (res.error) throw new Error(res.error);
            setFormData(initialFormData);
            setIsModalOpen(false);`;

const replacement = `            if (res.error) throw new Error(res.error);
            if (res.emailError) {
                alert('User created successfully, but the welcome email failed to send (SMTP Error: ' + res.emailError + ').\\n\\nYou can manually share this invite link with them:\\n' + window.location.origin + '/onboarding/setup?token=' + res.user.invite_token);
            }
            setFormData(initialFormData);
            setIsModalOpen(false);`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched AdminUsers.tsx successfully");
} else {
    console.log("Could not find target in AdminUsers.tsx");
}
