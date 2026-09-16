const fs = require('fs');

let engine = fs.readFileSync('services/DetectionEngine.ts', 'utf8');

// Enhance Placeholder Detection (Checkboxes)
engine = engine.replace(
  /if \(str === '\[ \]' \|\| str === '\[\]' \|\| str === '☐' \|\| str === '\( \)'\) \{/,
  `if (str === '[ ]' || str === '[]' || str === '☐' || str === '( )' || str === '○' || str === '〇' || str === 'o') {
          // If it's a lowercase 'o', only trust it if it's perfectly isolated and small, to avoid matching the letter 'o' in words.
          if (str === 'o' && w > 15) return;`
);

// Enhance Placeholder Detection (Lines)
engine = engine.replace(
  /if \(str\.includes\('____'\) && w > 2\) \{/,
  `const underscoreCount = (str.match(/_/g) || []).length;
        if (underscoreCount >= 3 && w > 2) {`
);

// Enhance Semantic Types (SSN, etc)
engine = engine.replace(
  /else if \(ctx\.includes\('email'\)\) \{ candidate\.type = 'email'; candidate\.canonicalKey = 'email'; \}/,
  `else if (ctx.includes('email')) { candidate.type = 'email'; candidate.canonicalKey = 'email'; }
          else if (ctx.includes('social security') || ctx.includes('ssn')) { candidate.type = 'number'; candidate.canonicalKey = 'ssn'; }
          else if (ctx.includes('imo') || ctx.includes('bga')) { candidate.type = 'text'; candidate.canonicalKey = 'imo'; }`
);

fs.writeFileSync('services/DetectionEngine.ts', engine);
console.log('Patched DetectionEngine with Protective Life specific intelligence');
