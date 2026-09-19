const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    
    // Calculate date for "since yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);
    
    const messages = await connection.search([['SINCE', yesterday]], { bodies: ['HEADER', 'TEXT'] });
    const recent = messages.slice(-5);
    for (const msg of recent) {
       const header = msg.parts.find(p => p.which === 'HEADER');
       const textPart = msg.parts.find(p => p.which === 'TEXT');
       const from = header.body.from ? header.body.from[0] : '';
       
       if (from.toLowerCase().includes('remmy') || from.toLowerCase().includes('shabani')) {
           console.log("=== REMMY EMAIL FOUND ===");
           console.log(textPart.body.substring(0, 500));
           
           let bodyString = textPart.body.replace(/=\r\n/g, '').replace(/=\n/g, '');
           console.log("=== LINKS ===");
           const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
           console.log(bodyString.match(urlRegex));
       }
    }
    connection.end();
    process.exit(0);
}).catch(console.error);
