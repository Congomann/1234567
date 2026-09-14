const fs = require('fs');

let content = fs.readFileSync('services/apiBackend.ts', 'utf8');

// Replace getActiveCarriers
content = content.replace(
    /return this\.apiRequest<any\[\]>\('\/carriers'/g,
    'return this.apiRequest<any[]>(`${this.baseUrl}/carriers`'
);

// Replace getCarrierDetails
content = content.replace(
    /return this\.apiRequest<any>\('\/carriers\/' \+ id/g,
    'return this.apiRequest<any>(`${this.baseUrl}/carriers/${id}`'
);

fs.writeFileSync('services/apiBackend.ts', content);
console.log('Patched apiBackend.ts');
