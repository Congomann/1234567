const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierIntegrations.tsx', 'utf8');

// Fix Tab3DBanner icon -> Icon
content = content.replace('icon={Plug}', 'Icon={Plug}');
// Fix c.id -> c.name (assuming carrier name is unique)
content = content.replace('key={c.id}', 'key={c.name}');

fs.writeFileSync('pages/admin/CarrierIntegrations.tsx', content);
console.log('Fixed TS errors in CarrierIntegrations');
