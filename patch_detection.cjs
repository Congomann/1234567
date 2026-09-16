const fs = require('fs');
let content = fs.readFileSync('services/DetectionEngine.ts', 'utf8');

// 1. Add "birth" to strong labels
content = content.replace(
  "const strongLabels = ['name', 'date', 'address', 'city', 'state', 'zip', 'phone', 'email', 'social security', 'ssn', 'tax id', 'suite', 'p.o. box', 'number', 'imo', 'market', 'licensed'];",
  "const strongLabels = ['name', 'date', 'address', 'city', 'state', 'zip', 'phone', 'email', 'social security', 'ssn', 'tax id', 'suite', 'p.o. box', 'number', 'imo', 'market', 'licensed', 'birth', 'first', 'last'];"
);

// 2. Fix the overlap logic in deduplication. Right now ANY overlap kills the field.
const oldOverlap = `return (overlapX > 0 && overlapY > 0);`;
const newOverlap = `
            const overlapArea = overlapX * overlapY;
            const candArea = cand.width * cand.height;
            // Only consider it a duplicate if it overlaps by more than 30%
            return (overlapArea > candArea * 0.3);
`;
content = content.replace(oldOverlap, newOverlap);

fs.writeFileSync('services/DetectionEngine.ts', content);
console.log('Patched Detection Engine');
