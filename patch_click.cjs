const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

builder = builder.replace(
  /if \(\!containerRef\.current\) return;\s*const rect = containerRef\.current\.getBoundingClientRect\(\);/,
  'const rect = e.currentTarget.getBoundingClientRect();'
);

// We can remove containerRef since we don't use it now
builder = builder.replace(/const containerRef = useRef<HTMLDivElement>\(null\);\n/, '');
builder = builder.replace(/ref=\{containerRef\}/, '');

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Fixed click logic');
