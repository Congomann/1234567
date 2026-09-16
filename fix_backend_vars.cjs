const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const oldDraw = `const imgDims = pngImage.scaleToFit(fieldWidth || 150, fieldHeight || 40);`;
const newDraw = `const fWidth = (field.width / 100) * width;
                const fHeight = (field.height / 100) * height;
                const imgDims = pngImage.scaleToFit(fWidth || 150, fHeight || 40);`;

content = content.replace(oldDraw, newDraw);
fs.writeFileSync('backend/server.cjs', content);
console.log('Fixed backend variables');
