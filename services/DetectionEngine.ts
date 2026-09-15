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

      // 1. Text Extraction & Basic Parsing
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

        textItems.push({ str: item.str.trim(), x, y, w, h, origY: ty });

        // Placeholder Detection (Checkboxes)
        const str = item.str.trim();
        if (str === '[ ]' || str === '[]' || str === '☐' || str === '( )' || str === '○' || str === '〇' || str === 'o') {
          // If it's a lowercase 'o', only trust it if it's perfectly isolated and small, to avoid matching the letter 'o' in words.
          if (str === 'o' && w > 15) return;
          pageCandidates.push({
            id: 'cand_' + Date.now() + Math.random().toString(36).substring(2),
            pageNumber: i,
            type: str === '( )' ? 'radio' : 'checkbox',
            label: null,
            canonicalKey: null,
            x, y, width: Math.max(w, 2), height: Math.max(h, 2),
            confidence: 0.85,
            source: ['text_placeholder'],
            needsReview: true
          });
        }
        
        // Placeholder Detection (Lines)
        const underscoreCount = (str.match(/_/g) || []).length;
        if (underscoreCount >= 3 && w > 2) {
          pageCandidates.push({
            id: 'cand_' + Date.now() + Math.random().toString(36).substring(2),
            pageNumber: i,
            type: 'text',
            label: null,
            canonicalKey: null,
            x, y, width: w, height: Math.max(h, 2.5),
            confidence: 0.6, // Base confidence, will boost with semantic label
            source: ['text_line'],
            needsReview: true
          });
        }
      });

      // 2. Native Field Detection
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

      // 3. Semantic Associator & Candidate Fusion
      // We process candidates that lack strong labels (text lines & placeholders)
      pageCandidates.forEach(candidate => {
        if (candidate.confidence >= 1.0) return; // Native fields bypass this

        // Spatial Search: Find nearest text item to the left or just above
        let closestText: any = null;
        let minDistance = Infinity;

        textItems.forEach(textItem => {
          // Ignore placeholder characters themselves
          if (textItem.str.includes('___') || textItem.str === '[ ]' || textItem.str === '☐') return;

          // Check if it's spatially left or above-left
          const isLeft = textItem.y >= candidate.y - 2 && textItem.y <= candidate.y + candidate.height + 2 && textItem.x < candidate.x;
          const isAbove = textItem.y < candidate.y && textItem.x >= candidate.x - 10 && textItem.x <= candidate.x + candidate.width;
          
          if (isLeft || isAbove) {
            const dx = candidate.x - (textItem.x + textItem.w);
            const dy = candidate.y - (textItem.y + textItem.h);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < minDistance && dist < 15) { // Threshold for proximity
              minDistance = dist;
              closestText = textItem;
            }
          }
        });

        if (closestText) {
          candidate.label = closestText.str;
          const ctx = closestText.str.toLowerCase();
          
          // Field Classifier based on Semantic Meaning
          if (ctx.includes('date')) { candidate.type = 'date'; candidate.canonicalKey = 'date'; }
          else if (ctx.includes('name')) { candidate.type = 'text'; candidate.canonicalKey = 'name'; }
          else if (ctx.includes('address')) { candidate.type = 'address'; candidate.canonicalKey = 'address'; }
          else if (ctx.includes('phone')) { candidate.type = 'phone'; candidate.canonicalKey = 'phone'; }
          else if (ctx.includes('email')) { candidate.type = 'email'; candidate.canonicalKey = 'email'; }
          else if (ctx.includes('social security') || ctx.includes('ssn')) { candidate.type = 'number'; candidate.canonicalKey = 'ssn'; }
          else if (ctx.includes('imo') || ctx.includes('bga')) { candidate.type = 'text'; candidate.canonicalKey = 'imo'; }
          else if (ctx.includes('npn') || ctx.includes('license')) { candidate.type = 'text'; candidate.canonicalKey = 'npn'; }
          else if (ctx.includes('signature') || ctx.includes('sign')) { candidate.type = 'signature'; candidate.canonicalKey = 'signature'; }
          else if (ctx.includes('initial')) { candidate.type = 'initials'; candidate.canonicalKey = 'initials'; }
          
          // Boost confidence due to semantic anchor presence
          candidate.confidence = Math.min(candidate.confidence + 0.3, 0.95);
          candidate.needsReview = candidate.confidence < 0.95;
        } else {
          // Isolated Geometry - drop confidence
          candidate.confidence -= 0.3;
        }
      });

      // 4. Validation & Deduplication
      // Filter out low confidence fields (< 0.70)
      const validCandidates = pageCandidates.filter(c => c.confidence >= 0.70);
      
      // Deduplicate: If a text placeholder overlaps heavily with a native field, prefer native
      const deduplicated: DetectionResult[] = [];
      validCandidates.forEach(cand => {
        let isDuplicate = false;
        if (cand.source.includes('text_line') || cand.source.includes('text_placeholder')) {
          // Check if it overlaps a native widget
          isDuplicate = validCandidates.some(other => {
            if (other.id === cand.id || !other.source.includes('native_widget')) return false;
            // Overlap check
            const overlapX = Math.max(0, Math.min(cand.x + cand.width, other.x + other.width) - Math.max(cand.x, other.x));
            const overlapY = Math.max(0, Math.min(cand.y + cand.height, other.y + other.height) - Math.max(cand.y, other.y));
            return (overlapX > 0 && overlapY > 0);
          });
        }
        if (!isDuplicate) {
          deduplicated.push(cand);
        }
      });

      finalCandidates.push(...deduplicated);
    }
    
    return finalCandidates;
  }
}
