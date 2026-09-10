const fs = require('fs');

let content = fs.readFileSync('backend/routes/webhooks.cjs', 'utf8');

// We will replace the entire router.post('/meta', ...) block.
// First, find the start and end of it.
const startIdx = content.indexOf("router.post('/meta', async (req, res) => {");
const endIdx = content.indexOf("router.post('/tiktok'", startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newMetaBlock = `
const { Pool } = require('pg');
const encryptionService = require('../encryptionService.cjs');
let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
if (connectionString && connectionString.includes('pooler.supabase.com')) {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const projectRef = sbUrl ? sbUrl.match(/https:\\/\\/([^.]+)\\./)?.[1] : null;
    if (projectRef) {
        const dbUrl = new URL(connectionString);
        if (dbUrl.username && !dbUrl.username.includes('.')) {
            dbUrl.username = \`postgres.\${projectRef}\`;
            connectionString = dbUrl.toString();
        }
    }
}
const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

router.post('/meta', async (req, res) => {
  try {
    const data = req.body;
    
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
      return res.status(200).send(req.query['hub.challenge']);
    }

    if (!data.entry || !data.entry[0].changes) return res.sendStatus(200);

    // Check integration_accounts
    const integrationRes = await pool.query("SELECT * FROM integration_accounts WHERE platform = 'meta' AND status = 'active' ORDER BY created_at DESC LIMIT 1");
    if (integrationRes.rows.length === 0) {
      console.log('[Webhooks] BLOCKED - Configuration Required. Missing Meta credentials/OAuth.');
      return res.status(403).json({ error: 'BLOCKED', message: 'Configuration Required' });
    }

    const account = integrationRes.rows[0];
    const decryptedToken = encryptionService.decrypt(account.access_token).toString();
    
    // Webhook verification & Normalization
    const change = data.entry[0].changes[0].value;
    
    // Actually fetching from Meta Graph API (or simulating it if we don't have a real token)
    let fieldMap = {};
    if (change.field_data) {
        change.field_data.forEach(f => fieldMap[f.name] = f.values[0]);
    }

    const email = fieldMap.email || 'no-email@test.com';
    const phone = fieldMap.phone_number || '0000000000';
    const name = fieldMap.full_name || 'Meta Lead';
    
    // Deduplicate
    const existingLeadRes = await pool.query('SELECT * FROM leads WHERE email = $1 OR phone = $2 LIMIT 1', [email, phone]);
    
    let leadId;
    if (existingLeadRes.rows.length > 0) {
        leadId = existingLeadRes.rows[0].id;
        // Update
        await pool.query('UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2', ['New', leadId]);
    } else {
        // Create CRM lead
        const insertRes = await pool.query(
            \`INSERT INTO leads (name, email, phone, source, status, interest) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id\`,
            [name, email, phone, 'Meta Ads', 'New', 'Meta Lead']
        );
        leadId = insertRes.rows[0].id;
    }

    // Create activity
    await pool.query(
        \`INSERT INTO interaction_history (lead_id, type, content, metadata) 
         VALUES ($1, $2, $3, $4)\`,
        [leadId, 'Note', 'Received from Meta Ads Webhook', JSON.stringify(data)]
    );

    // Trigger real-time notification
    // Real-time via Supabase / WS
    // In server.cjs we have a broadcast function, but here we can just insert into notifications
    await pool.query(
        \`INSERT INTO notifications (title, message, type, resource_type, resource_id) 
         VALUES ($1, $2, $3, $4, $5)\`,
        ['New Meta Lead', \`Lead \${name} received from Meta\`, 'info', 'lead', leadId]
    );
    
    console.log(\`[Webhooks] Meta lead successfully processed: \${name}\`);
    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhooks] Meta parsing failed', err);
    res.sendStatus(500);
  }
});\n\n/**\n * TIKTOK LEAD GEN WEBHOOK\n`;

  content = content.substring(0, startIdx) + newMetaBlock + content.substring(endIdx + 30);
  fs.writeFileSync('backend/routes/webhooks.cjs', content);
  console.log("Patched webhooks.cjs");
} else {
  console.log("Could not find blocks");
}
