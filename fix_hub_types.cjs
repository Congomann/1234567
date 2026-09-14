const fs = require('fs');
const file = 'pages/crm/ContractingHub.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "\"Name\": user?.firstName + ' ' + user?.lastName,",
  "\"Name\": (user as any)?.firstName ? ((user as any)?.firstName + ' ' + (user as any)?.lastName) : user?.name,"
);
content = content.replace(
  "\"NPN\": user?.npn || \"12345678\"",
  "\"NPN\": (user as any)?.npn || \"12345678\""
);

fs.writeFileSync(file, content);
console.log("Fixed ContractingHub types");
