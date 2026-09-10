const fs = require('fs');

let types = fs.readFileSync('types.ts', 'utf-8');

types = types.replace(
  "commissionAmount?: number;\n  carrier?: string;",
  "commissionAmount?: number;\n  carrier?: string;\n  missedPayments?: number;\n  birthday?: string;\n  status?: string;\n  coverageAmount?: number;\n  policyDuration?: number;"
);

fs.writeFileSync('types.ts', types, 'utf-8');
console.log('Patched types.ts');
