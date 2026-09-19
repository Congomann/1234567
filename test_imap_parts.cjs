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

imaps.connect(config).then(function (connection) {
    return connection.openBox('INBOX').then(function () {
        var searchCriteria = ['UNSEEN'];
        var fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };
        return connection.search(searchCriteria, fetchOptions).then(function (messages) {
            console.log("Found " + messages.length + " messages");
            if (messages.length > 0) {
               console.log("Available connection methods:", Object.keys(connection));
               console.log("Methods on connection prototype:", Object.getOwnPropertyNames(Object.getPrototypeOf(connection)));
               // Print properties of the message to see how to get bodies
               let item = messages[0];
               console.log("Message parts:", item.parts.map(p => p.which));
            }
            connection.end();
        });
    });
}).catch(err => {
    console.error("IMAP Connection error:", err);
});
