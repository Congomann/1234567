const fs = require('fs');
let content = fs.readFileSync('services/DetectionEngine.ts', 'utf8');

// Change gap threshold from 4 to 0.5
content = content.replace(
  '(item.x - (currentLine.x + currentLine.w)) < 4',
  '(item.x - (currentLine.x + currentLine.w)) < 0.5'
);

fs.writeFileSync('services/DetectionEngine.ts', content);
