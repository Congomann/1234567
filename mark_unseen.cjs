const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    const messages = await connection.search(['ALL'], { bodies: ['HEADER'], fetchOptions: { limit: 5 }});
    const recent = messages.slice(-2); // get last 2
    for (const msg of recent) {
       console.log("Marking unseen:", msg.attributes.uid);
       await connection.delFlags(msg.attributes.uid, ['\\Seen']);
    }
    console.log("Done");
    connection.end();
}).catch(console.error);
