const fs = require('fs');
let content = fs.readFileSync('services/DetectionEngine.ts', 'utf8');

const oldCheck = `const isRight = cand.x >= textItem.x && cand.x <= textItem.x + textItem.w + 30 && Math.abs(cand.y - textItem.y) < 5;
          const isBelow = cand.y >= textItem.y && cand.y <= textItem.y + 8 && cand.x >= textItem.x - 5 && cand.x <= textItem.x + 20;
          return isRight || isBelow || (cand.x <= textItem.x && cand.x + cand.width >= textItem.x && cand.y >= textItem.y - 2 && cand.y <= textItem.y + textItem.h + 5);`;

const newCheck = `const isRight = cand.x >= textItem.x && cand.x <= textItem.x + textItem.w + 10 && Math.abs(cand.y - textItem.y) < 3;
          const isBelow = cand.y >= textItem.y && cand.y <= textItem.y + 4 && cand.x >= textItem.x - 2 && cand.x <= textItem.x + 10;
          return isRight || isBelow || (cand.x <= textItem.x + 2 && cand.x + cand.width >= textItem.x - 2 && cand.y >= textItem.y - 2 && cand.y <= textItem.y + textItem.h + 2);`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('services/DetectionEngine.ts', content);
console.log('Patched hasExistingBox bounds');
