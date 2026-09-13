const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const target1 = `const { name, email, role, category } = req.body;`;
const target2 = `const { name, email, role, category, contractLevel } = req.body;`;
content = content.replace(target1, target2);

const target3 = `INSERT INTO users (name, email, role, category, status, invite_token, onboarding_completed)
      VALUES ($1, $2, $3, $4, 'pending_activation', $5, false)
      ON CONFLICT (email) DO UPDATE 
      SET invite_token = EXCLUDED.invite_token, status = 'pending_activation'`;

const target4 = `INSERT INTO users (name, email, role, category, status, invite_token, onboarding_completed, contract_level)
      VALUES ($1, $2, $3, $4, 'pending_activation', $5, false, $6)
      ON CONFLICT (email) DO UPDATE 
      SET invite_token = EXCLUDED.invite_token, status = 'pending_activation', contract_level = EXCLUDED.contract_level`;

content = content.replace(target3, target4);

const target5 = `[name, email, role || 'Advisor', category || 'Insurance & General', inviteToken]`;
const target6 = `[name, email, role || 'Advisor', category || 'Insurance & General', inviteToken, contractLevel || 70]`;
content = content.replace(target5, target6);

fs.writeFileSync(path, content);
