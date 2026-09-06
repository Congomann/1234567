const fs = require('fs');
let file = fs.readFileSync('pages/website/ExploreSolutions.tsx', 'utf8');

// Remove import
file = file.replace(/import \{ TrillionCalculatorHub \} from '\.\.\/\.\.\/components\/TrillionCalculatorHub';\n/g, '');

// Remove the block
const blockToRemove = `        {/* Trillion Calculator Hub */}
        <div className="mt-20">
          <TrillionCalculatorHub />
        </div>`;

file = file.replace(blockToRemove, '');

fs.writeFileSync('pages/website/ExploreSolutions.tsx', file);
console.log('Removed TrillionCalculatorHub from ExploreSolutions');
