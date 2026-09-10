const fs = require('fs');
const files = ['pages/website/LoadListing.tsx', 'pages/website/LoadBoard.tsx', 'pages/website/LogisticsHub.tsx'];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('const mockLoads')) {
       // Replace mockLoads declaration with an empty array or fetch if there's no state.
       // Actually, we should just use useEffect to fetch real loads.
       content = content.replace(/const mockLoads: Partial<FreightLoad>\[\] = \[[\s\S]*?\];/g, '');
       content = content.replace(/mockLoads/g, 'loads');
       
       // Ensure loads state is defined
       if (!content.includes('const [loads, setLoads]')) {
           content = content.replace(/const \[isMobileMenuOpen/, "const [loads, setLoads] = useState<any[]>([]);\n  useEffect(() => {\n    Backend.getLoads().then(setLoads).catch(console.error);\n  }, []);\n  const [isMobileMenuOpen");
           // Also add import { Backend }
           if (!content.includes('Backend')) {
               content = content.replace(/import React/, "import React"); // Ensure React is imported
               content = content.replace(/import \{/, "import { Backend } from '../../services/apiBackend';\nimport {");
           }
       }
       fs.writeFileSync(file, content);
       console.log('Patched', file);
    }
  }
}
