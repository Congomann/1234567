const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Add imports
if (!content.includes('import { Disclaimer }')) {
  content = content.replace(
    "import { TermsOfUse } from './pages/website/TermsOfUse';",
    "import { TermsOfUse } from './pages/website/TermsOfUse';\nimport { Disclaimer } from './pages/website/Disclaimer';\nimport { CookiePolicy } from './pages/website/CookiePolicy';"
  );
}

// Add routes
if (!content.includes('<Route path="/disclaimer"')) {
  content = content.replace(
    '<Route path="/terms" element={<PublicLayout><TermsOfUse /></PublicLayout>} />',
    '<Route path="/terms" element={<PublicLayout><TermsOfUse /></PublicLayout>} />\n            <Route path="/disclaimer" element={<PublicLayout><Disclaimer /></PublicLayout>} />\n            <Route path="/cookies" element={<PublicLayout><CookiePolicy /></PublicLayout>} />'
  );
}

fs.writeFileSync('App.tsx', content);
console.log('App.tsx routes updated.');
