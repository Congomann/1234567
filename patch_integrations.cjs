const fs = require('fs');
const file = '/Users/newholland/1234567/backend/routes/integrations.cjs';
let content = fs.readFileSync(file, 'utf8');

const APP_URL = "https://newhollandfinancial.com";

// Google
content = content.replace(
  /const authUrl = `https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?client_id=REAL_CLIENT_ID\&redirect_uri=\$\{encodeURIComponent\('https:\/\/api\.nhfg\.com\/api\/integrations\/google\/oauth\/callback'\)\}\&response_type=code\&scope=https:\/\/www\.googleapis\.com\/auth\/adwords`;/,
  `const clientId = process.env.GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${clientId}&redirect_uri=\${encodeURIComponent('${APP_URL}/api/integrations/google/oauth/callback')}&response_type=code&scope=https://www.googleapis.com/auth/adwords\`;`
);

// LinkedIn
content = content.replace(
  /const authUrl = `https:\/\/www\.linkedin\.com\/oauth\/v2\/authorization\?response_type=code\&client_id=REAL_CLIENT_ID\&redirect_uri=\$\{encodeURIComponent\('https:\/\/api\.nhfg\.com\/api\/integrations\/linkedin\/oauth\/callback'\)\}\&scope=r_liteprofile%20r_emailaddress%20rw_ads`;/,
  `const clientId = process.env.LINKEDIN_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = \`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=\${clientId}&redirect_uri=\${encodeURIComponent('${APP_URL}/api/integrations/linkedin/oauth/callback')}&scope=r_liteprofile%20r_emailaddress%20rw_ads\`;`
);

// Meta
content = content.replace(
  /const authUrl = `https:\/\/www\.facebook\.com\/v19\.0\/dialog\/oauth\?client_id=REAL_CLIENT_ID\&redirect_uri=\$\{encodeURIComponent\('https:\/\/api\.nhfg\.com\/api\/integrations\/meta\/oauth\/callback'\)\}\&scope=ads_management,leads_retrieval`;/,
  `const clientId = process.env.META_CLIENT_ID || 'MISSING_CLIENT_ID';
  const authUrl = \`https://www.facebook.com/v19.0/dialog/oauth?client_id=\${clientId}&redirect_uri=\${encodeURIComponent('${APP_URL}/api/integrations/meta/oauth/callback')}&scope=ads_management,leads_retrieval\`;`
);

fs.writeFileSync(file, content);
