const fs = require('fs');
const path = './services/apiBackend.ts';
let content = fs.readFileSync(path, 'utf8');

const newMethod = `
  async deleteCarrier(name: string) {
    const res = await fetch(\`\${API_URL}/carriers/\${encodeURIComponent(name)}\`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete carrier');
    }
    return res.json();
  },
`;

if (!content.includes('deleteCarrier(name: string)')) {
  content = content.replace("async addCarrier(name: string, category: string) {", newMethod + "\n  async addCarrier(name: string, category: string) {");
  fs.writeFileSync(path, content);
}
