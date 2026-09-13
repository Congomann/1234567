const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const oldErr = "    res.status(500).json({ error: 'Failed to invite user' });";
const newErr = "    console.error('Invite Error:', err);\n    res.status(500).json({ error: err.message || 'Failed to invite user' });";

content = content.replace(oldErr, newErr);
fs.writeFileSync(path, content);
