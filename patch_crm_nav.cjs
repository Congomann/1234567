const fs = require('fs');
const path = './components/CRMData.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `            vertical.push({ path: '/crm/telephony', label: 'Telephony & SMS', icon: Phone, tourId: 'nav-telephony' });
            vertical.push({ path: '/crm/video-meetings', label: 'Video Meetings', icon: Video, tourId: 'nav-video' });`;
const replacement = `            vertical.push({ path: '/crm/telephony', label: 'Telephony & SMS', icon: Phone, tourId: 'nav-telephony' });
            vertical.push({ path: '/crm/video-meetings', label: 'Video Meetings', icon: Video, tourId: 'nav-video' });
            vertical.push({ path: '/crm/contracting', label: 'Contracting', icon: FileCheck, tourId: 'nav-contracting' });`;

content = content.replace(target, replacement);

const adminTarget = `                { path: '/crm/admin/commissions', label: 'Commission Recon', icon: BadgeDollarSign, tourId: 'nav-admin-comm' },`;
const adminReplacement = `                { path: '/crm/admin/commissions', label: 'Commission Recon', icon: BadgeDollarSign, tourId: 'nav-admin-comm' },
                { path: '/crm/admin/contracting', label: 'Carrier Contracting', icon: Building2, tourId: 'nav-admin-contracting' },
                { path: '/crm/admin/contracting/queue', label: 'Review Queue', icon: ClipboardCheck, tourId: 'nav-admin-queue' },`;

content = content.replace(adminTarget, adminReplacement);

fs.writeFileSync(path, content);
