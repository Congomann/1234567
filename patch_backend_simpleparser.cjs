const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const oldBlock = `    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    let createdCount = 0;
    
    for (const item of messages) {
      // removed getPartsData
      const headerPart = item.parts.find(p => p.which === 'HEADER');
      const textPart = item.parts.find(p => p.which === 'TEXT');
      
      let subject = 'Carrier Contracting';
      if (headerPart && headerPart.body && headerPart.body.subject) {
        subject = headerPart.body.subject[0];
      }
      
      let bodyString = textPart ? textPart.body : '';
      if (!bodyString) continue;
      
      const lowerBody = bodyString.toLowerCase();
      const lowerSubject = subject.toLowerCase();
      
      // Heuristic: Is it contracting related?
      if (lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerBody.includes('licensing') || lowerSubject.includes('contracting') || lowerSubject.includes('licensing')) {
        // Extract a URL (very simple regex for http/https)
        const urlRegex = /(https?:\\/\\/[^\\s"'<>]+)/g;
        const urls = bodyString.match(urlRegex);
        
        if (urls && urls.length > 0) {`;

const newBlock = `    const fetchOptions = { bodies: [''], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    let createdCount = 0;
    
    for (const item of messages) {
      const rawPart = item.parts.find(p => p.which === '');
      if (!rawPart) continue;
      
      const parsed = await simpleParser(rawPart.body);
      const subject = parsed.subject || 'Carrier Contracting';
      const bodyString = parsed.text || parsed.html || '';
      if (!bodyString) continue;
      
      const lowerBody = bodyString.toLowerCase();
      const lowerSubject = subject.toLowerCase();
      
      // Heuristic: Is it contracting related?
      if (lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerBody.includes('licensing') || lowerSubject.includes('contracting') || lowerSubject.includes('licensing')) {
        // Extract a URL (very simple regex for http/https)
        const urlRegex = /(https?:\\/\\/[^\\s"'<>]+)/g;
        const urls = bodyString.match(urlRegex);
        
        if (urls && urls.length > 0) {`;

content = content.replace(oldBlock, newBlock);

if (content.includes('const parsed = await simpleParser')) {
  fs.writeFileSync('backend/server.cjs', content);
  console.log("Patched successfully.");
} else {
  console.log("Failed to patch. Could not find oldBlock.");
}
