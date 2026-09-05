const fs = require('fs');

const files = [
    '/Users/newholland/1234567/pages/crm/insurance/InsurancePages.tsx',
    '/Users/newholland/1234567/pages/crm/mortgage/MortgagePages.tsx',
    '/Users/newholland/1234567/pages/crm/real-estate/RealEstatePages.tsx',
    '/Users/newholland/1234567/pages/crm/securities/SecuritiesPages.tsx',
    '/Users/newholland/1234567/pages/crm/logistics/LogisticsHub.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We want to find <button ...> that do not contain onClick and do not contain type="submit"
    // Because regex for HTML is tricky, we can replace all occurrences of <button followed by attributes.
    // If it doesn't have onClick and doesn't have type="submit", add onClick={() => alert('Feature in development')}
    
    let updated = content.replace(/<button([^>]+)>/g, (match, attrs) => {
        if (!attrs.includes('onClick') && !attrs.includes('type="submit"')) {
            return `<button onClick={() => alert('Feature in development')}${attrs}>`;
        }
        return match;
    });

    // Also let's check for <a ...> or anything styled as a button? The prompt just said "buttons".
    
    if (content !== updated) {
        fs.writeFileSync(file, updated);
        console.log(`Updated ${file}`);
    } else {
        console.log(`No changes in ${file}`);
    }
});
