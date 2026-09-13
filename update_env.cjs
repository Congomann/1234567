const fs = require('fs');
const path = './backend/.env';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/SMTP_PASS=.*/g, 'SMTP_PASS=NewHollandSales26');
fs.writeFileSync(path, content);
console.log("Updated SMTP_PASS in backend/.env");
