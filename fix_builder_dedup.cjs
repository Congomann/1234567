const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldUpdate = `setFields([...fields, ...mappedFields]);`;
const newUpdate = `
        // Deduplicate against already existing fields in the builder
        const newFields = mappedFields.filter(mf => {
          return !fields.some(existing => {
            if (existing.pageNumber !== mf.pageNumber) return false;
            
            const overlapX = Math.max(0, Math.min(mf.x + mf.width, existing.x + existing.width) - Math.max(mf.x, existing.x));
            const overlapY = Math.max(0, Math.min(mf.y + mf.height, existing.y + existing.height) - Math.max(mf.y, existing.y));
            const overlapArea = overlapX * overlapY;
            
            const mfArea = mf.width * mf.height;
            const existingArea = existing.width * existing.height;
            
            return overlapArea > (mfArea * 0.25) || overlapArea > (existingArea * 0.25);
          });
        });
        setFields([...fields, ...newFields]);`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Fixed double-click auto-detect duplication');
