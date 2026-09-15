const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const enhancedAutoDetect = `
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

        // 1. Detect Native Fields
        annotations.forEach((anno: any) => {
          if (anno.subtype === 'Widget') {
            pageHasWidgets = true;
            const rect = anno.rect;
            const x = (rect[0] / viewport.width) * 100;
            const y = (1 - (rect[3] / viewport.height)) * 100;
            const w = ((rect[2] - rect[0]) / viewport.width) * 100;
            const h = ((rect[3] - rect[1]) / viewport.height) * 100;
            
            detectedFields.push({
              id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
              name: anno.fieldName || 'Form Field',
              type: anno.fieldType === 'Btn' ? 'checkbox' : 'text',
              mappedTo: 'none',
              x: x, y: y, width: w, height: h, pageNumber: i
            });
            widgetCount++;
          }
        });

        // 2. If this SPECIFIC page has no native fields, use Text-Scanning for flattened lines
        if (!pageHasWidgets) {
          const textContent = await page.getTextContent();
          textContent.items.forEach((item: any) => {
            if (item.str && item.str.includes('____')) {
              const tx = item.transform[4];
              const ty = item.transform[5];
              const widthPt = item.width;
              const heightPt = item.height || 12;
              
              const x = (tx / viewport.width) * 100;
              const y = (1 - ((ty + heightPt) / viewport.height)) * 100;
              const w = (widthPt / viewport.width) * 100;
              const h = (heightPt / viewport.height) * 100;
              
              // Only add if it's a reasonably sized line
              if (w > 2) {
                detectedFields.push({
                  id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
                  name: 'Detected Line',
                  type: 'text',
                  mappedTo: 'none',
                  x: x, y: y, width: w, height: Math.max(h, 2.5), pageNumber: i
                });
                textLineCount++;
              }
            }
          });
        }
      }
      
      if (detectedFields.length > 0) {
        setFields([...fields, ...detectedFields]);
        alert(\`Success! Auto-detected \${widgetCount} native fields and \${textLineCount} flattened lines across the full application.\`);
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
  enhancedAutoDetect
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched Auto-Detect to scan full application page-by-page');
