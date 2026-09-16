const fs = require('fs');

['pages/admin/CarrierFormBuilder.tsx', 'pages/crm/ContractingHub.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('pdfWidth')) {
    // Add simple responsive width state
    content = content.replace(
      /const \[numPages, setNumPages\] = useState<number \| null>\(null\);/,
      "const [numPages, setNumPages] = useState<number | null>(null);\n  const [pdfWidth, setPdfWidth] = useState(typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 800) : 800);\n\n  useEffect(() => {\n    const handleResize = () => setPdfWidth(Math.min(window.innerWidth - 48, 800));\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);"
    );
    
    // Ensure useEffect is imported
    if (content.match(/import React, {([^}]*)}/) && !content.includes('useEffect')) {
       content = content.replace(/import React, {/, "import React, { useEffect, ");
    } else if (content.match(/import {([^}]*)} from 'react'/) && !content.includes('useEffect')) {
       content = content.replace(/import {/, "import { useEffect, ");
    }
    
    // Update the Page render
    content = content.replace(/<Page\s+pageNumber=\{([^}]+)\}\s+renderTextLayer=\{false\}\s+renderAnnotationLayer=\{false\}\s+width=\{800\}\s*\/>/g, '<Page pageNumber={$1} renderTextLayer={false} renderAnnotationLayer={false} width={pdfWidth} />');
    
    fs.writeFileSync(file, content);
    console.log('Patched responsive PDF scale in ' + file);
  }
});
