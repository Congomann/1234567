const fs = require('fs');
let content = fs.readFileSync('pages/Login.tsx', 'utf8');

const regex = /<div className="mt-6 text-center">[\s\S]*?Don't have an account\?\{' '\}[\s\S]*?<\/div>/m;
content = content.replace(regex, '');

fs.writeFileSync('pages/Login.tsx', content);
console.log('Patched Login.tsx');
