const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const injection = `
// Mount Root Insurance API
try {
  const rootInsuranceRoutes = require('./routes/rootInsuranceRoutes.cjs');
  app.use('/api/root-insurance', rootInsuranceRoutes);
} catch (e) {
  console.warn('Failed to load Root Insurance routes:', e.message);
}
`;

content = content.replace("module.exports = app;", injection + "\nmodule.exports = app;");
fs.writeFileSync(path, content);
