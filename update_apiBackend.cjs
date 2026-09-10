const fs = require('fs');
let file = fs.readFileSync('services/apiBackend.ts', 'utf8');

file = file.replace(
  /async bookPublicEvent\(data: any\): Promise<void> \{([\s\S]*?)await this\.handleResponse\(res\);\n        \}\n    \}/,
  `async bookPublicEvent(data: any): Promise<any> {\n        if (USE_REAL_BACKEND) {\n            const res = await fetch(\`\${this.baseUrl}/public/book\`, {\n                method: 'POST',\n                headers: { 'Content-Type': 'application/json' },\n                body: JSON.stringify(data)\n            });\n            return await this.handleResponse(res);\n        }\n    }`
);

fs.writeFileSync('services/apiBackend.ts', file);
console.log('Updated apiBackend.ts');
