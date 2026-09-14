const fs = require('fs');
let content = fs.readFileSync('services/apiBackend.ts', 'utf8');

content = content.replace(
  /async addCarrier\(name: string, category: string\): Promise<any> \{/,
  `async addCarrier(name: string, category: string, paperworkFileName?: string): Promise<any> {`
);

content = content.replace(
  /const newCarrier = \{ name, category \};/,
  `const newCarrier = { name, category, paperworkFileName };`
);

content = content.replace(
  /await DB\.save\('carriers', \{ id: name, name, category \}\);/,
  `await DB.save('carriers', { id: name, name, category, paperworkFileName });`
);

fs.writeFileSync('services/apiBackend.ts', content);
console.log('Updated apiBackend.ts');
