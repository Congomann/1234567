const fs = require('fs');
let vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

vercel.headers = [
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=0, must-revalidate"
      }
    ]
  },
  {
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
];

fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2));
console.log('Added strict cache-control headers');
