const fs = require('fs');
const filePath = 'pages/admin/AnnualReportAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `  const [partnerRevenue, setPartnerRevenue] = useState(companySettings.annualReportData?.partnerRevenue || [
    { id: 1, name: 'Aflac', vertical: 'Life Insurance', revenue: 600000, visible: true },
    { id: 2, name: 'Transamerica', vertical: 'Life Insurance', revenue: 1000000, visible: true },
    { id: 3, name: 'Chubb', vertical: 'Property & Casualty', revenue: 450000, visible: true },
    { id: 4, name: 'Geico', vertical: 'Property & Casualty', revenue: 230000, visible: true },
  ]);`,
  `  const [partnerRevenue, setPartnerRevenue] = useState(companySettings.annualReportData?.partnerRevenue || []);`
);

content = content.replace(
  `  const [metrics, setMetrics] = useState(companySettings.annualReportData?.metrics || {
    totalSales: 18.2,
    salesGrowth: 46.5,
    complianceRating: 99.8,
    activeLawsuits: 0,
    totalFines: 0,
    activeStates: 48
  });`,
  `  const [metrics, setMetrics] = useState(companySettings.annualReportData?.metrics || {
    totalSales: 0,
    salesGrowth: 0,
    complianceRating: 100,
    activeLawsuits: 0,
    totalFines: 0,
    activeStates: 0
  });`
);

content = content.replace(
  `  const [audits, setAudits] = useState(companySettings.annualReportData?.audits || [
    { id: 1, state: 'New York', date: '2025-03-15', status: 'Cleared', findings: 0 },
    { id: 2, state: 'Florida', date: '2025-02-10', status: 'Cleared', findings: 0 },
  ]);`,
  `  const [audits, setAudits] = useState(companySettings.annualReportData?.audits || []);`
);

content = content.replace(
  `  const [quarterlyReports, setQuarterlyReports] = useState(companySettings.annualReportData?.quarterlyReports || [
    { id: 1, title: 'Q1 2025 Transparency Report', date: '2025-04-01', status: 'Published' },
    { id: 2, title: 'Q2 2025 Transparency Report', date: '2025-07-01', status: 'Draft' },
  ]);`,
  `  const [quarterlyReports, setQuarterlyReports] = useState(companySettings.annualReportData?.quarterlyReports || []);`
);

fs.writeFileSync(filePath, content);
console.log('Patched AnnualReportAdmin.tsx');
