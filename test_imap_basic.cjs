const imaps = require('imap-simple');

const config = {
    imap: {
        user: 'sales@newhollandfinancial.com',
        password: 'SalesNew@2026',
        host: 'imap.larksuite.com',
        port: 993,
        tls: true,
        authTimeout: 5000,
        debug: console.log
    }
};

imaps.connect(config).then(function (connection) {
    console.log("Connected, opening INBOX...");
    return connection.openBox('INBOX').then(function () {
        console.log("INBOX opened. Searching...");
        var searchCriteria = ['UNSEEN'];
        var fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };
        return connection.search(searchCriteria, fetchOptions).then(function (messages) {
            console.log("Found " + messages.length + " messages");
            connection.end();
        });
    });
}).catch(err => {
    console.error("IMAP Connection error:", err);
});
