const fs = require('fs');
let file = fs.readFileSync('App.tsx', 'utf8');

file = file.replace(/<Route path="\/life-insurance\/quote" element=\{<PublicLayout><LifeInsuranceFunnel \/><\/PublicLayout>\} \/>/g, '');
fs.writeFileSync('App.tsx', file);
console.log('Removed life-insurance/quote route');
