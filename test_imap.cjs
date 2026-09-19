const imaps = require('imap-simple');

const config = {
    imap: {
        user: 'sales@newhollandfinancial.com',
        password: 'SalesNew@2026',
        host: 'imap.larksuite.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

imaps.connect(config).then(function (connection) {
    console.log("Connected to IMAP successfully!");
    connection.end();
}).catch(err => {
    console.error("IMAP Connection error:", err);
});
