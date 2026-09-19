const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    const messages = await connection.search([['UID', '103']], { bodies: ['HEADER', 'TEXT'] });
    console.log("UID 103 FETCHED", messages.length);
    const messages2 = await connection.search([['UID', '97']], { bodies: ['HEADER', 'TEXT'] });
    console.log("UID 97 FETCHED", messages2.length);
    const messages3 = await connection.search([['UID', '98']], { bodies: ['HEADER', 'TEXT'] });
    console.log("UID 98 FETCHED", messages3.length);
    connection.end();
    process.exit(0);
}).catch(console.error);
