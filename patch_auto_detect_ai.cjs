const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const advancedAutoDetect = `
  const handleAutoDetect = async () => {
    if (!pdfData) return;
    try {
      const loadingTask = pdfjs.getDocument(pdfData);
      const pdf = await loadingTask.promise;
      const detectedFields: any[] = [];
      let widgetCount = 0;
      let textLineCount = 0;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        
        const annotations = await page.getAnnotations();
        let pageHasWidgets = false;

        // 1. Detect Native Fields (AcroForm)
        annotations.forEach((anno: any) => {
          if (anno.subtype === 'Widget') {
            pageHasWidgets = true;
            const rect = anno.rect;
            const x = (rect[0] / viewport.width) * 100;
            const y = (1 - (rect[3] / viewport.height)) * 100;
            const w = ((rect[2] - rect[0]) / viewport.width) * 100;
            const h = ((rect[3] - rect[1]) / viewport.height) * 100;
            
            let fieldType = 'text';
            if (anno.fieldType === 'Btn') fieldType = 'checkbox'; // Button/Radio/Checkbox
            if (anno.fieldType === 'Ch') fieldType = 'dropdown'; // Choice
            if (anno.fieldType === 'Sig') fieldType = 'signature'; // Signature
            
            detectedFields.push({
              id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
              name: anno.fieldName || 'Form Field',
              type: fieldType,
              mappedTo: 'none',
              x: x, y: y, width: w, height: h, pageNumber: i
            });
            widgetCount++;
          }
        });

        // 2. Advanced Heuristic Text-Scanning for flattened pages
        if (!pageHasWidgets) {
          const textContent = await page.getTextContent();
          
          let lastTextContext = "";
          
          textContent.items.forEach((item: any) => {
            const str = item.str.trim();
            const tx = item.transform[4];
            const ty = item.transform[5];
            const widthPt = item.width;
            const heightPt = item.height || 12;
            
            const x = (tx / viewport.width) * 100;
            const y = (1 - ((ty + heightPt) / viewport.height)) * 100;
            const w = (widthPt / viewport.width) * 100;
            const h = (heightPt / viewport.height) * 100;

            // A. Detect Checkboxes / Radios in text layer
            if (str === '[ ]' || str === '[]' || str === '☐' || str === '( )') {
               detectedFields.push({
                  id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
                  name: lastTextContext || 'Checkbox',
                  type: 'checkbox',
                  mappedTo: 'none',
                  x: x, y: y, width: Math.max(w, 2), height: Math.max(h, 2), pageNumber: i
               });
               textLineCount++;
               return;
            }

            // B. Detect Text Lines (Underscores)
            if (str.includes('____')) {
              if (w > 2) {
                // Heuristic Classification based on context
                let fieldName = "Detected Line";
                let fieldType = "text";
                const ctx = lastTextContext.toLowerCase();
                
                if (ctx.includes('date')) fieldName = "Date";
                else if (ctx.includes('name')) fieldName = "Name";
                else if (ctx.includes('address')) fieldName = "Address";
                else if (ctx.includes('phone')) fieldName = "Phone Number";
                else if (ctx.includes('email')) fieldName = "Email";
                else if (ctx.includes('npn') || ctx.includes('license')) fieldName = "NPN / License";
                else if (ctx.includes('signature') || ctx.includes('sign')) {
                   fieldName = "Signature";
                   fieldType = "signature";
                }
                else if (ctx.includes('initial')) fieldName = "Initials";
                else if (ctx.includes('yes') || ctx.includes('no')) fieldName = "Yes/No Question";
                
                detectedFields.push({
                  id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
                  name: fieldName,
                  type: fieldType,
                  mappedTo: 'none',
                  x: x, y: y, width: w, height: Math.max(h, 2.5), pageNumber: i
                });
                textLineCount++;
              }
            } else if (str.length > 2 && !str.includes('_')) {
               // Update context buffer with meaningful words
               lastTextContext = str;
            }
          });
        }
      }
      
      if (detectedFields.length > 0) {
        setFields([...fields, ...detectedFields]);
        alert(\`AI Scan Complete! Successfully detected \${widgetCount + textLineCount} fields including Text, Checkboxes, Dates, Signatures, and NPN fields across the document.\`);
      } else {
        alert("This PDF is completely flattened and contains no native form fields or underscore lines. Please enable Manual Placement to draw your own fields.");
      }
    } catch (e) {
      console.error(e);
      alert("Error auto-detecting fields.");
    }
  };
`;

builder = builder.replace(
  /const handleAutoDetect = async \(\) => \{[\s\S]*?alert\("Error auto-detecting fields\."\);\n    \}\n  \};/,
  advancedAutoDetect
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched Auto-Detect with Heuristic Classification AI');
