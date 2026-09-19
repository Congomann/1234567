const imaps = require('imap-simple');

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
    var fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };
    const messages = await connection.search(['UNSEEN'], fetchOptions);
    console.log("Found " + messages.length + " messages");
    
    for (const item of messages) {
      const headerPart = item.parts.find(p => p.which === 'HEADER');
      const textPart = item.parts.find(p => p.which === 'TEXT');
      
      let subject = 'Carrier Contracting';
      if (headerPart && headerPart.body && headerPart.body.subject) {
        subject = headerPart.body.subject[0];
      }
      
      let bodyString = textPart ? textPart.body : '';
      console.log("Body length:", bodyString.length);
      
      // Clean up Quoted-Printable line breaks
      bodyString = bodyString.replace(/=\r\n/g, '').replace(/=\n/g, '');
      
      const lowerBody = bodyString.toLowerCase();
      const lowerSubject = subject.toLowerCase();
      
      if (lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerBody.includes('licensing') || lowerSubject.includes('contracting') || lowerSubject.includes('licensing')) {
        const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
        const urls = bodyString.match(urlRegex);
        if (urls && urls.length > 0) {
           console.log("Found URL:", urls[0]);
        }
      }
    }
    connection.end();
}).catch(console.error);
