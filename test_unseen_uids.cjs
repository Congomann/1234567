const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    const messages = await connection.search(['UNSEEN'], { bodies: [] });
    console.log("UNSEEN UIDS:", messages.map(m => m.attributes.uid));
    connection.end();
    process.exit(0);
}).catch(console.error);
