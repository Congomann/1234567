const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

const config = {
    imap: {
        user: 'sales@newhollandfinancial.com',
        password: 'SalesNew@2026',
        host: 'imap.larksuite.com',
        port: 993,
        tls: true,
        authTimeout: 5000
    }
};

imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    var fetchOptions = { bodies: [''], markSeen: false }; // Fetch entire raw message
    const messages = await connection.search(['UNSEEN'], fetchOptions);
    console.log("Found " + messages.length + " messages");
    
    for (const item of messages) {
      const rawPart = item.parts.find(p => p.which === '');
      if (rawPart) {
         const parsed = await simpleParser(rawPart.body);
         console.log("Parsed Subject:", parsed.subject);
         
         const bodyString = parsed.text || parsed.html || '';
         const lowerBody = bodyString.toLowerCase();
         const lowerSubject = (parsed.subject || '').toLowerCase();
         
         if (lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerBody.includes('licensing') || lowerSubject.includes('contracting') || lowerSubject.includes('licensing')) {
            const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
            const urls = bodyString.match(urlRegex);
            if (urls && urls.length > 0) {
               console.log("Found Parsed URL:", urls[0]);
            }
         }
      }
    }
    
    connection.end();
}).catch(err => {
    console.error("IMAP Connection error:", err);
});
