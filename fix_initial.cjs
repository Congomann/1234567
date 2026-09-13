const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    const initialFormData: Partial<User & { password?: string }> = {
        name: '',
        email: '',
        role: UserRole.ADVISOR,
        category: AdvisorCategory.INSURANCE,
        productsSold: [],
    };`;
    
const replacement = `    const initialFormData: Partial<User & { password?: string }> = {
        name: '',
        email: '',
        role: UserRole.ADVISOR,
        category: AdvisorCategory.INSURANCE,
        productsSold: [],
        contractLevel: 65,
    };`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
