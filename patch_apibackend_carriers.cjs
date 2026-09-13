const fs = require('fs');
const path = './services/apiBackend.ts';
let content = fs.readFileSync(path, 'utf8');

const newMethods = `
  // CARRIERS
  async getCarriers() {
    const res = await fetch(\`\${API_URL}/carriers\`);
    if (!res.ok) throw new Error('Failed to fetch carriers');
    return res.json();
  },

  async addCarrier(name: string, category: string) {
    const res = await fetch(\`\${API_URL}/carriers\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add carrier');
    }
    return res.json();
  },
`;

if (!content.includes('getCarriers()')) {
  content = content.replace("export const apiBackend = {", "export const apiBackend = {\n" + newMethods);
  fs.writeFileSync(path, content);
}
