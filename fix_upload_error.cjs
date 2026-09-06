const fs = require('fs');
let file = fs.readFileSync('pages/admin/WebsiteSettings.tsx', 'utf8');

file = file.replace(/setUploadError\(err\.message \|\| 'Upload failed\. File might be too large\.'\);/g, `setUploadError(err instanceof Error ? err.message : (err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)) || 'Upload failed. File might be too large.'));`);

fs.writeFileSync('pages/admin/WebsiteSettings.tsx', file);
console.log('Fixed WebsiteSettings.tsx');
