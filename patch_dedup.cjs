const fs = require('fs');
let content = fs.readFileSync('services/DetectionEngine.ts', 'utf8');

const oldDedup = `      // 6. Final Deduplication
      const deduplicated: DetectionResult[] = [];
      pageCandidates.forEach(cand => {
        let isDuplicate = false;
        if (cand.source.includes('whitespace_gap') || cand.source.includes('merged_line')) {
          isDuplicate = deduplicated.some(other => {
            const overlapX = Math.max(0, Math.min(cand.x + cand.width, other.x + other.width) - Math.max(cand.x, other.x));
            const overlapY = Math.max(0, Math.min(cand.y + cand.height, other.y + other.height) - Math.max(cand.y, other.y));
            
            const overlapArea = overlapX * overlapY;
            const candArea = cand.width * cand.height;
            // Only consider it a duplicate if it overlaps by more than 30%
            return (overlapArea > candArea * 0.3);

          });
        }
        if (!isDuplicate) {
          deduplicated.push(cand);
        }
      });`;

const newDedup = `      // 6. Aggressive Final Deduplication
      const deduplicated: DetectionResult[] = [];
      // Sort candidates by confidence so higher confidence fields are kept first
      const sortedCandidates = [...pageCandidates].sort((a, b) => b.confidence - a.confidence);

      sortedCandidates.forEach(cand => {
        const isDuplicate = deduplicated.some(other => {
          // Check for significant overlap
          const overlapX = Math.max(0, Math.min(cand.x + cand.width, other.x + other.width) - Math.max(cand.x, other.x));
          const overlapY = Math.max(0, Math.min(cand.y + cand.height, other.y + other.height) - Math.max(cand.y, other.y));
          
          const overlapArea = overlapX * overlapY;
          const candArea = cand.width * cand.height;
          const otherArea = other.width * other.height;
          
          // Overlap threshold: if the overlapping area is > 25% of EITHER box, it's a duplicate
          if (overlapArea > (candArea * 0.25) || overlapArea > (otherArea * 0.25)) return true;
          
          // Distance threshold: if the centers are very close (within 1.5% in both dimensions), it's a duplicate
          const candCenterX = cand.x + (cand.width / 2);
          const candCenterY = cand.y + (cand.height / 2);
          const otherCenterX = other.x + (other.width / 2);
          const otherCenterY = other.y + (other.height / 2);
          
          const distX = Math.abs(candCenterX - otherCenterX);
          const distY = Math.abs(candCenterY - otherCenterY);
          
          if (distX < 2.0 && distY < 2.0) return true;
          
          return false;
        });

        if (!isDuplicate) {
          deduplicated.push(cand);
        }
      });`;

content = content.replace(oldDedup, newDedup);
fs.writeFileSync('services/DetectionEngine.ts', content);
console.log('Patched deduplication logic in DetectionEngine.ts');
