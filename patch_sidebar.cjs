const fs = require('fs');
const path = './components/CRMData.tsx';
let content = fs.readFileSync(path, 'utf8');

// We want to add Root Insurance to the sidebar.
// Find the area where "Auto Quotes" is added.
const searchTarget = "if (user.category === AdvisorCategory.INSURANCE || products.includes(ProductType.AUTO) || products.includes(ProductType.COMMERCIAL)) {";
const addNav = `
        if (user.category === AdvisorCategory.ADMIN || user.category === AdvisorCategory.INSURANCE || products.includes(ProductType.AUTO) || products.includes(ProductType.COMMERCIAL)) {
            vertical.push({ path: '/crm/root-insurance', label: 'Root Insurance', icon: Car, tourId: 'nav-root-insurance' });
        }
`;

content = content.replace(searchTarget, addNav + '\n        ' + searchTarget);
fs.writeFileSync(path, content);
