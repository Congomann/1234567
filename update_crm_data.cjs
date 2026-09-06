const fs = require('fs');
let file = fs.readFileSync('components/CRMData.tsx', 'utf8');

const sharedString = `        const shared = [
            { path: '/crm/telephony', label: 'Telephony & AI Suite', icon: Phone, tourId: 'nav-telephony' },
            { path: '/crm/precision-intelligence', label: 'Precision Intel', icon: Calculator, tourId: 'nav-precision-intel' },
            { path: '/crm/legal', label: 'Legal & Compliance', icon: Scale, tourId: 'nav-legal' },
            { path: '/crm/bank-verification', label: 'Bank Verification', icon: Landmark, tourId: 'nav-bank-verification' },
            { path: '/crm/profile', label: 'Profile', icon: CircleUser, tourId: 'nav-profile' },
        ];`;

file = file.replace(/const shared = \[\s*\{ path: '\/crm\/telephony', label: 'Telephony & AI Suite', icon: Phone, tourId: 'nav-telephony' \},\s*\{ path: '\/crm\/legal', label: 'Legal & Compliance', icon: Scale, tourId: 'nav-legal' \},\s*\{ path: '\/crm\/bank-verification', label: 'Bank Verification', icon: Landmark, tourId: 'nav-bank-verification' \},\s*\{ path: '\/crm\/profile', label: 'Profile', icon: CircleUser, tourId: 'nav-profile' \},\s*\];/g, sharedString);

fs.writeFileSync('components/CRMData.tsx', file);
console.log('Updated CRMData.tsx');
