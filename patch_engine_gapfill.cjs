const fs = require('fs');

let engine = fs.readFileSync('services/DetectionEngine.ts', 'utf8');

const gapFillLogic = `
      // 3.5 Whitespace Gap Fill (For forms drawn with vector tables instead of text underscores)
      const strongLabels = ['name', 'date', 'address', 'city', 'state', 'zip', 'phone', 'email', 'social security', 'ssn', 'tax id', 'suite', 'p.o. box', 'number', 'imo'];
      
      textItems.forEach(textItem => {
        const ctx = textItem.str.toLowerCase();
        
        // Skip if this text is just a placeholder or too short
        if (ctx.length < 3 || ctx.includes('___')) return;

        // Check if this text item is a strong label
        const isStrongLabel = strongLabels.some(label => ctx.includes(label));
        if (!isStrongLabel) return;

        // Check if we ALREADY have a candidate box near this label
        const hasExistingBox = pageCandidates.some(cand => {
          // Is the candidate immediately to the right or below this text?
          const isRight = cand.x >= textItem.x && cand.x <= textItem.x + textItem.w + 30 && Math.abs(cand.y - textItem.y) < 5;
          const isBelow = cand.y >= textItem.y && cand.y <= textItem.y + 8 && cand.x >= textItem.x - 5 && cand.x <= textItem.x + 20;
          return isRight || isBelow;
        });

        if (!hasExistingBox) {
           // We found a label that has NO fillable box associated with it! 
           // Let's create a Smart Gap-Fill Candidate.
           
           // Determine if inline (label:) or stacked
           const isInline = ctx.endsWith(':');
           
           let fieldType = 'text';
           let canonicalKey = null;
           if (ctx.includes('date')) { fieldType = 'date'; canonicalKey = 'date'; }
           else if (ctx.includes('name')) { canonicalKey = 'name'; }
           else if (ctx.includes('address') || ctx.includes('city') || ctx.includes('state') || ctx.includes('zip')) { canonicalKey = 'address'; }
           else if (ctx.includes('phone') || ctx.includes('fax')) { fieldType = 'phone'; canonicalKey = 'phone'; }
           else if (ctx.includes('email')) { fieldType = 'email'; canonicalKey = 'email'; }
           else if (ctx.includes('ssn') || ctx.includes('social security')) { fieldType = 'number'; canonicalKey = 'ssn'; }

           pageCandidates.push({
             id: 'gap_' + Date.now() + Math.random().toString(36).substring(2),
             pageNumber: i,
             type: fieldType,
             label: textItem.str,
             canonicalKey: canonicalKey,
             // If inline, place to the right. If stacked, place below.
             x: isInline ? (textItem.x + textItem.w + 1) : textItem.x,
             y: isInline ? textItem.y : (textItem.y + textItem.h + 0.5),
             width: isInline ? 20 : Math.max(textItem.w, 25), // reasonable default width
             height: 2.5,
             confidence: 0.80, // High enough to be valid, but marked as suggestion
             source: ['whitespace_gap'],
             needsReview: true
           });
        }
      });

      // 4. Validation & Deduplication
`;

engine = engine.replace(
  /\/\/ 4\. Validation & Deduplication/,
  gapFillLogic
);

fs.writeFileSync('services/DetectionEngine.ts', engine);
console.log('Patched DetectionEngine with Whitespace Gap Fill');
