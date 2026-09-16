const fs = require('fs');

let vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

// Ensure redirect array exists
if (!vercel.redirects) {
  vercel.redirects = [];
}

// Add the www to non-www redirect
vercel.redirects.unshift({
  "source": "/(.*)",
  "destination": "https://newhollandfinancial.com/$1",
  "permanent": true,
  "has": [
    {
      "type": "host",
      "value": "www.newhollandfinancial.com"
    }
  ]
});

fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2));
console.log('Added www redirect to vercel.json');
