const imaps = require('imap-simple');
const config = {
    imap: { user: 'sales@newhollandfinancial.com', password: 'SalesNew@2026', host: 'imap.larksuite.com', port: 993, tls: true, authTimeout: 5000 }
};
imaps.connect(config).then(async function (connection) {
    await connection.openBox('INBOX');
    // search for ALL messages, but only get the UIDs
    const results = await connection.search(['ALL'], { bodies: [] });
    // get the last 3 uids
    const recent = results.slice(-3);
    for (const msg of recent) {
       console.log("Marking unseen:", msg.attributes.uid);
       await connection.delFlags(msg.attributes.uid, ['\\Seen']);
    }
    console.log("Done");
    connection.end();
    process.exit(0);
}).catch(console.error);
