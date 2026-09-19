const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

content = content.replace(
  "lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerSubject.includes('contracting')",
  "lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerBody.includes('licensing') || lowerSubject.includes('contracting') || lowerSubject.includes('licensing')"
);

fs.writeFileSync('backend/server.cjs', content);
