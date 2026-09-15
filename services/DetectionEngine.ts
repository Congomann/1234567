import { pdfjs } from 'react-pdf';

export interface DetectionResult {
  id: string;
  pageNumber: number;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'address' | 'checkbox' | 'radio' | 'dropdown' | 'signature' | 'initials';
  label: string | null;
  canonicalKey: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  source: string[];
  needsReview: boolean;
}

export class DetectionEngine {
  static async detectFields(pdfData: string): Promise<DetectionResult[]> {
    const loadingTask = pdfjs.getDocument(pdfData);
    const pdf = await loadingTask.promise;
    const finalCandidates: DetectionResult[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const annotations = await page.getAnnotations();
      const textContent = await page.getTextContent();
      
      const pageCandidates: DetectionResult[] = [];
      const textItems: any[] = [];
      const underscoreItems: any[] = [];

      // 1. Precise Text Extraction
      textContent.items.forEach((item: any) => {
        if (!item.str || item.str.trim() === '') return;
        
        const tx = item.transform[4];
        const ty = item.transform[5];
        const widthPt = item.width;
        const heightPt = item.height || 12;

        const x = (tx / viewport.width) * 100;
        const y = (1 - ((ty + heightPt) / viewport.height)) * 100;
        const w = (widthPt / viewport.width) * 100;
        const h = (heightPt / viewport.height) * 100;

        const str = item.str.trim();

        // Separate underscores for precision merging later
        if (str.includes('_')) {
           underscoreItems.push({ str, x, y, w, h: Math.max(h, 2) });
        } else {
           textItems.push({ str, x, y, w, h });
        }

        // Perfect Square Checkboxes (including the Protective Life 'o')
        if (str === '[ ]' || str === '[]' || str === '☐' || str === '( )' || str === '○' || str === '〇') {
          pageCandidates.push({
            id: 'cand_' + Date.now() + Math.random().toString(36).substring(2),
            pageNumber: i,
            type: str === '( )' ? 'radio' : 'checkbox',
            label: null,
            canonicalKey: null,
            x, y, width: Math.max(w, 2), height: Math.max(h, 2),
            confidence: 0.95, // High confidence for explicit checkbox symbols
            source: ['text_placeholder'],
            needsReview: false
          });
        } else if (str === 'o' && w <= 3 && h <= 3) {
           // Protective Life uses standalone 'o' for checkboxes. Must be small.
           pageCandidates.push({
            id: 'cand_' + Date.now() + Math.random().toString(36).substring(2),
            pageNumber: i,
            type: 'checkbox',
            label: null,
            canonicalKey: null,
            x, y, width: 2, height: 2,
            confidence: 0.85,
            source: ['text_placeholder_o'],
            needsReview: true
          });
        }
      });

      // 2. Precision Underscore Merging (DocuSign Style)
      // Sort by Y, then X
      underscoreItems.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 2) return a.x - b.x;
        return a.y - b.y;
      });

      let currentLine = null;
      for (const item of underscoreItems) {
        if (!currentLine) {
          currentLine = { ...item };
          continue;
        }
        
        // If it's on the same Y level and very close in X, merge it!
        // We allow up to 4% X-gap to bridge spaces in "___ ___"
        if (Math.abs(currentLine.y - item.y) < 2 && (item.x - (currentLine.x + currentLine.w)) < 4) {
          currentLine.w = (item.x + item.w) - currentLine.x;
          currentLine.h = Math.max(currentLine.h, item.h);
          currentLine.str += item.str;
        } else {
          // Push previous line
          if (currentLine.w > 3) { // Must be a reasonably long line
            pageCandidates.push({
              id: 'line_' + Date.now() + Math.random().toString(36).substring(2),
              pageNumber: i,
              type: 'text',
              label: null,
              canonicalKey: null,
              x: currentLine.x, 
              y: currentLine.y - 0.5, // Shift slightly up to sit ON the line
              width: currentLine.w, 
              height: 2.5, // Standard height for typing
              confidence: 0.85,
              source: ['merged_line'],
              needsReview: false // Lines are reliable
            });
          }
          currentLine = { ...item };
        }
      }
      if (currentLine && currentLine.w > 3) {
        pageCandidates.push({
          id: 'line_' + Date.now() + Math.random().toString(36).substring(2),
          pageNumber: i,
          type: 'text',
          label: null,
          canonicalKey: null,
          x: currentLine.x, y: currentLine.y - 0.5, width: currentLine.w, height: 2.5,
          confidence: 0.85,
          source: ['merged_line'],
          needsReview: false
        });
      }

      // 3. Native Field Detection
      annotations.forEach((anno: any) => {
        if (anno.subtype === 'Widget') {
          const rect = anno.rect;
          const x = (rect[0] / viewport.width) * 100;
          const y = (1 - (rect[3] / viewport.height)) * 100;
          const w = ((rect[2] - rect[0]) / viewport.width) * 100;
          const h = ((rect[3] - rect[1]) / viewport.height) * 100;
          
          let fieldType: any = 'text';
          if (anno.fieldType === 'Btn') fieldType = 'checkbox';
          if (anno.fieldType === 'Ch') fieldType = 'dropdown';
          if (anno.fieldType === 'Sig') fieldType = 'signature';
          
          pageCandidates.push({
            id: anno.id || 'native_' + Date.now() + Math.random().toString(36).substring(2),
            pageNumber: i,
            type: fieldType,
            label: anno.fieldName || 'Native Field',
            canonicalKey: null,
            x, y, width: w, height: h,
            confidence: 1.0,
            source: ['native_widget'],
            needsReview: false
          });
        }
      });

      // 4. Semantic Associator for Lines (Assigning Labels)
      pageCandidates.forEach(candidate => {
        if (candidate.confidence >= 1.0) return; // Native fields bypass this

        // Spatial Search: Find nearest text item to the left or just above
        let closestText: any = null;
        let minDistance = Infinity;

        textItems.forEach(textItem => {
          const isLeft = textItem.y >= candidate.y - 3 && textItem.y <= candidate.y + candidate.height + 3 && textItem.x < candidate.x;
          const isAbove = textItem.y < candidate.y && textItem.x >= candidate.x - 10 && textItem.x <= candidate.x + candidate.width;
          
          if (isLeft || isAbove) {
            const dx = candidate.x - (textItem.x + textItem.w);
            const dy = candidate.y - (textItem.y + textItem.h);
            const dist = Math.sqrt(Math.max(0, dx)*Math.max(0, dx) + Math.max(0, dy)*Math.max(0, dy));
            
            if (dist < minDistance && dist < 15) {
              minDistance = dist;
              closestText = textItem;
            }
          }
        });

        if (closestText) {
          candidate.label = closestText.str.replace(/:$/, '').trim(); // Remove trailing colon
          const ctx = candidate.label.toLowerCase();
          
          if (ctx.includes('date')) { candidate.type = 'date'; candidate.canonicalKey = 'date'; }
          else if (ctx.includes('name')) { candidate.type = 'text'; candidate.canonicalKey = 'name'; }
          else if (ctx.includes('address') || ctx.includes('city') || ctx.includes('state') || ctx.includes('zip')) { candidate.type = 'address'; candidate.canonicalKey = 'address'; }
          else if (ctx.includes('phone') || ctx.includes('fax')) { candidate.type = 'phone'; candidate.canonicalKey = 'phone'; }
          else if (ctx.includes('email')) { candidate.type = 'email'; candidate.canonicalKey = 'email'; }
          else if (ctx.includes('npn') || ctx.includes('license')) { candidate.type = 'text'; candidate.canonicalKey = 'npn'; }
          else if (ctx.includes('social security') || ctx.includes('ssn') || ctx.includes('tax id')) { candidate.type = 'number'; candidate.canonicalKey = 'ssn'; }
          else if (ctx.includes('signature') || ctx.includes('sign')) { candidate.type = 'signature'; candidate.canonicalKey = 'signature'; }
          else if (ctx.includes('initial')) { candidate.type = 'initials'; candidate.canonicalKey = 'initials'; }
          
          candidate.confidence = Math.min(candidate.confidence + 0.1, 0.95);
        }
      });

      // 5. Smart Whitespace Table Cell Detection (DocuSign Style)
      // For empty boxes that are drawn with vector lines, text mapping will miss them.
      // We look for strong standalone labels that have NO field near them.
      const strongLabels = ['name', 'date', 'address', 'city', 'state', 'zip', 'phone', 'email', 'social security', 'ssn', 'tax id', 'suite', 'p.o. box', 'number', 'imo', 'market', 'licensed', 'birth', 'first', 'last'];
      
      textItems.forEach(textItem => {
        const ctx = textItem.str.toLowerCase();
        if (ctx.length < 3) return;

        const isStrongLabel = strongLabels.some(label => ctx.includes(label));
        if (!isStrongLabel) return;

        const hasExistingBox = pageCandidates.some(cand => {
          const isRight = cand.x >= textItem.x && cand.x <= textItem.x + textItem.w + 10 && Math.abs(cand.y - textItem.y) < 3;
          const isBelow = cand.y >= textItem.y && cand.y <= textItem.y + 4 && cand.x >= textItem.x - 2 && cand.x <= textItem.x + 10;
          return isRight || isBelow || (cand.x <= textItem.x + 2 && cand.x + cand.width >= textItem.x - 2 && cand.y >= textItem.y - 2 && cand.y <= textItem.y + textItem.h + 2);
        });

        if (!hasExistingBox) {
           const isInline = ctx.endsWith(':');
           let fieldType: any = 'text';
           let canonicalKey = null;
           if (ctx.includes('date')) { fieldType = 'date'; canonicalKey = 'date'; }
           else if (ctx.includes('name')) { canonicalKey = 'name'; }
           else if (ctx.includes('address') || ctx.includes('city') || ctx.includes('state') || ctx.includes('zip')) { canonicalKey = 'address'; }
           else if (ctx.includes('phone') || ctx.includes('fax')) { fieldType = 'phone'; canonicalKey = 'phone'; }
           else if (ctx.includes('email')) { fieldType = 'email'; canonicalKey = 'email'; }
           else if (ctx.includes('ssn') || ctx.includes('social security') || ctx.includes('tax id')) { fieldType = 'number'; canonicalKey = 'ssn'; }

           pageCandidates.push({
             id: 'gap_' + Date.now() + Math.random().toString(36).substring(2),
             pageNumber: i,
             type: fieldType,
             label: textItem.str.replace(/:$/, '').trim(),
             canonicalKey: canonicalKey,
             x: isInline ? (textItem.x + textItem.w + 2) : textItem.x,
             y: isInline ? textItem.y : (textItem.y + textItem.h + 1),
             width: isInline ? 25 : Math.max(textItem.w + 5, 20),
             height: 2.5,
             confidence: 0.90, 
             source: ['whitespace_gap'],
             needsReview: false // Make it auto-confirmed to match pdffiller's confidence
           });
        }
      });

      // 6. Aggressive Final Deduplication
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
      });

      finalCandidates.push(...deduplicated);
    }
    
    return finalCandidates;
  }
}
