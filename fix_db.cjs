const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = "await safeAddUserCol('contract_level', 'NUMERIC(5,2)');";
content = content.replace(target, "await safeAddUserCol('contract_level', 'NUMERIC(5,2)');\n    await safeAddUserCol('onboarding_completed', 'BOOLEAN DEFAULT FALSE');");
fs.writeFileSync(path, content);
