const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    const messages = await connection.search([['UID', '103']], { bodies: ['HEADER', 'TEXT'] });
    const msg = messages[0];
    const textPart = msg.parts.find(p => p.which === 'TEXT');
    let bodyString = textPart.body.replace(/=\r\n/g, '').replace(/=\n/g, '');
    console.log("=== REMMY EMAIL TEXT ===\n", bodyString.substring(0, 1000));
    console.log("=== MATCHED URLS ===\n", bodyString.match(/(https?:\/\/[^\s"'<>]+)/g));
    connection.end();
    process.exit(0);
}).catch(console.error);
