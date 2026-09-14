const fs = require('fs');
const path = './components/CRMData.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add to vertical (Advisor side)
const verticalTarget = `vertical.push({ path: '/crm/commissions', label: 'Commissions', icon: LineChart, tourId: 'nav-commissions' });`;
const verticalReplacement = `vertical.push({ path: '/crm/commissions', label: 'Commissions', icon: LineChart, tourId: 'nav-commissions' });
            vertical.push({ path: '/crm/contracting', label: 'Contracting', icon: FileCheck, tourId: 'nav-contracting' });`;

if (!content.includes("path: '/crm/contracting'")) {
  content = content.replace(verticalTarget, verticalReplacement);
}

// 2. Add to admin (Admin side)
const adminTarget = `admin.push({ path: '/crm/admin/commissions', label: 'Commission Recon', icon: LineChart, tourId: 'nav-commissions-recon' });`;
const adminReplacement = `admin.push({ path: '/crm/admin/commissions', label: 'Commission Recon', icon: LineChart, tourId: 'nav-commissions-recon' });
            admin.push({ path: '/crm/admin/contracting', label: 'Carrier Contracting', icon: Building2, tourId: 'nav-admin-contracting' });
            admin.push({ path: '/crm/admin/contracting/queue', label: 'Contracting Queue', icon: ClipboardCheck, tourId: 'nav-admin-contracting-queue' });`;

if (!content.includes("path: '/crm/admin/contracting'")) {
  content = content.replace(adminTarget, adminReplacement);
}

fs.writeFileSync(path, content);
console.log("Patched navigation");
