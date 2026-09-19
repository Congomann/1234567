const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    const messages = await connection.search(['ALL'], { bodies: ['HEADER'], fetchOptions: { limit: 10 } });
    const recent = messages.slice(-5);
    for (const msg of recent) {
       const header = msg.parts.find(p => p.which === 'HEADER');
       const subject = header.body.subject ? header.body.subject[0] : 'No Subject';
       const from = header.body.from ? header.body.from[0] : 'Unknown';
       console.log(`UID: ${msg.attributes.uid} | SEEN: ${msg.attributes.flags.includes('\\Seen')} | FROM: ${from} | SUBJECT: ${subject}`);
    }
    connection.end();
    process.exit(0);
}).catch(console.error);
