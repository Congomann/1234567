const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const oldBlock = `    const fetchOptions = { bodies: [''], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    let createdCount = 0;
    
    for (const item of messages.slice(0, 3)) {
      const rawPart = item.parts.find(p => p.which === '');
      if (!rawPart) continue;
      
      const parsed = await simpleParser(rawPart.body);
      const subject = parsed.subject || 'Carrier Contracting';
      const bodyString = parsed.text || parsed.html || '';
      if (!bodyString) continue;
      
      const lowerBody = bodyString.toLowerCase();
      const lowerSubject = subject.toLowerCase();`;

const newBlock = `    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    let createdCount = 0;
    
    for (const item of messages.slice(0, 3)) {
      const headerPart = item.parts.find(p => p.which === 'HEADER');
      const textPart = item.parts.find(p => p.which === 'TEXT');
      
      let subject = 'Carrier Contracting';
      if (headerPart && headerPart.body && headerPart.body.subject) {
        subject = headerPart.body.subject[0];
      }
      
      let bodyString = textPart ? textPart.body : '';
      if (!bodyString) continue;
      
      // Clean up Quoted-Printable line breaks
      bodyString = bodyString.replace(/=\\r\\n/g, '').replace(/=\\n/g, '');
      
      const lowerBody = bodyString.toLowerCase();
      const lowerSubject = subject.toLowerCase();`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('backend/server.cjs', content);
console.log("Patched server.cjs to use fast parsing");
