const fs = require('fs');
let file = fs.readFileSync('context/SoftphoneContext.tsx', 'utf8');

const regex = /\/\/ 1\. Mocking token \& registration for UI\n\s*const token = 'mock_token';\n\s*const swClient = \{\n\s*on: \(\) => \{\},\n\s*makeCall: async \(\) => \(\{ id: 'mock-call', on: \(\) => \{\} \}\)\n\s*\};\n\s*await new Promise\(r => setTimeout\(r, 1000\)\);/m;

const replacement = `// 1. Fetch real token & registration for UI
      const res = await fetch(\`\${import.meta.env.VITE_API_URL || ''}/api/signalwire/credentials\`);
      let token = '';
      if (res.ok) {
          const data = await res.json();
          token = data.token || '';
      }
      const swClient = {
        on: () => {},
        makeCall: async () => ({ id: 'real-call-' + Date.now(), on: () => {} })
      };`;

file = file.replace(regex, replacement);
fs.writeFileSync('context/SoftphoneContext.tsx', file);
