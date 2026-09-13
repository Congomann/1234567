const Imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Configure IMAP credentials using environment variables
const imapConfig = {
    imap: {
        user: process.env.SMTP_USER || 'sales@newhollandfinancial.com',
        password: process.env.SMTP_PASS || 'NewHollandSales26',
        host: process.env.IMAP_HOST || 'imap.larksuite.com',
        port: process.env.IMAP_PORT || 993,
        tls: true,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
    }
};

async function processMessage(message, connection) {
    try {
        const all = message.parts.find(part => part.which === '');
        const id = message.attributes.uid;
        const idHeader = "Imap-Id: " + id + "\\r\\n";
        
        const mail = await simpleParser(idHeader + all.body);
        
        const subject = mail.subject;
        const fromEmail = mail.from.value[0].address;
        const textBody = mail.text || mail.html || "";
        
        console.log(\`[IMAP Monitor] Processing email from \${fromEmail}: \${subject}\`);
        
        // 1. Insert into mailbox_messages
        const msgResult = await pool.query(
            \`INSERT INTO mailbox_messages (message_id, subject, from_email, body, processed_status)
             VALUES ($1, $2, $3, $4, $5) RETURNING id\`,
            [mail.messageId || \`uid-\${id}\`, subject, fromEmail, textBody, 'UNPROCESSED']
        );
        const internalMsgId = msgResult.rows[0].id;

        // 2. Mock AI Classification Engine (Simulating GPT-4o parsing)
        const classification = simulateAiClassification(subject, textBody, fromEmail);
        
        if (classification.confidence >= 95 && classification.status === 'Approved') {
            // HIGH CONFIDENCE: Auto-process
            console.log(\`[IMAP Monitor] High confidence approval detected for \${classification.advisorName}\`);
            
            // Try to find the advisor in DB
            const userRes = await pool.query(\`SELECT id FROM users WHERE email ILIKE $1 OR first_name || ' ' || last_name ILIKE $2 LIMIT 1\`, 
                [\`%\${classification.advisorEmail}%\`, \`%\${classification.advisorName}%\`]);
                
            if (userRes.rows.length > 0) {
                const advisorId = userRes.rows[0].id;
                
                // Add carrier assignment
                await pool.query(
                    \`INSERT INTO carrier_assignments (advisor_id, carrier_id, contract_number, status, effective_date)
                     VALUES ($1, $2, $3, $4, CURRENT_DATE)\`,
                    [advisorId, classification.carrierId || 1, classification.contractNumber, 'Active']
                );
                
                // Mark email as AUTO_PROCESSED
                await pool.query(\`UPDATE mailbox_messages SET processed_status = 'AUTO_PROCESSED' WHERE id = $1\`, [internalMsgId]);
                
                // Note: We would trigger a notification to the advisor here
            } else {
                // Advisor not found, send to admin queue
                await routeToAdminQueue(internalMsgId, classification);
            }
            
        } else if (classification.isCompanyContract) {
            // COMPANY CONTRACT: Requires CEO signature
            console.log(\`[IMAP Monitor] Company Contract detected. Routing to CEO signature queue.\`);
            await routeToAdminQueue(internalMsgId, { ...classification, suggestedAction: 'Needs CEO Signature' });
        } else {
            // LOW CONFIDENCE or PENDING: Send to Admin Queue
            console.log(\`[IMAP Monitor] Low confidence or manual review required. Routing to Admin Queue.\`);
            await routeToAdminQueue(internalMsgId, classification);
        }

        // Mark as seen in the IMAP mailbox
        await connection.addFlags(id, ['\\Seen']);
        
    } catch (err) {
        console.error('[IMAP Monitor] Error processing message:', err);
    }
}

async function routeToAdminQueue(msgId, classification) {
    await pool.query(
        \`INSERT INTO admin_review_queue (mailbox_message_id, ai_confidence, suggested_action, status)
         VALUES ($1, $2, $3, $4)\`,
        [msgId, classification.confidence, JSON.stringify(classification), 'PENDING']
    );
    await pool.query(\`UPDATE mailbox_messages SET processed_status = 'QUEUED_FOR_REVIEW' WHERE id = $1\`, [msgId]);
}

// Simulates LLM structured extraction based on PRD requirements
function simulateAiClassification(subject, body, from) {
    const text = (subject + " " + body).toLowerCase();
    
    // Default Unknown
    let result = {
        confidence: 50,
        type: 'Unknown',
        carrierId: 1, // Mock
        advisorName: null,
        status: 'Unknown',
        contractNumber: null,
        isCompanyContract: false
    };

    // Check for company-level contracts
    if (text.includes("agency agreement") || text.includes("principal") || text.includes("ceo contract")) {
        result.isCompanyContract = true;
        result.type = 'Agency Contract';
        result.confidence = 96;
        return result;
    }

    // Check for standard approvals
    if (text.includes("approved") || text.includes("ready to sell") || text.includes("appointed")) {
        result.status = 'Approved';
        result.confidence = 96;
        result.type = 'Carrier Appointment Approval';
        result.contractNumber = 'ACT-' + Math.floor(Math.random() * 100000);
        
        // Mock extraction of advisor name
        if (text.includes("john smith")) result.advisorName = "John Smith";
        else if (text.includes("newholland")) result.advisorName = "System User";
    }
    
    // Check for additional info
    if (text.includes("additional information") || text.includes("missing") || text.includes("needs e&o")) {
        result.status = 'Additional Information Required';
        result.confidence = 90;
        result.type = 'Carrier Pending';
    }

    return result;
}

async function startMailMonitor() {
    try {
        console.log('[IMAP Monitor] Starting connection...');
        const connection = await Imap.connect(imapConfig);
        await connection.openBox('INBOX');
        console.log('[IMAP Monitor] Connected to INBOX. Listening for new carrier emails...');

        // Fetch unseen messages
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: [''], markSeen: false };
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        for (let item of messages) {
            await processMessage(item, connection);
        }

        // Listen for new mail
        connection.on('mail', async (numNewMsgs) => {
            console.log(\`[IMAP Monitor] \${numNewMsgs} new mail(s) received\`);
            const newMessages = await connection.search(['UNSEEN'], fetchOptions);
            for (let item of newMessages) {
                await processMessage(item, connection);
            }
        });
        
    } catch (err) {
        console.error('[IMAP Monitor] Failed to start:', err.message);
        // We catch and suppress so it doesn't crash the main server if credentials fail
    }
}

module.exports = { startMailMonitor };
