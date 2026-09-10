const fs = require('fs');
let file = fs.readFileSync('backend/routes/webhooks.cjs', 'utf8');

// We'll replace the entire /gmail router.post with /larksuite router.post
const newRoute = `/**
 * LARKSUITE WEBHOOK (Phase 5)
 * Receives events from Larksuite Open Platform (e.g. emails/messages).
 */
router.post('/larksuite', express.json(), async (req, res) => {
  try {
    const payload = req.body;
    
    // 1. Handle URL Verification Challenge from Lark
    if (payload && payload.type === 'url_verification' && payload.challenge) {
      console.log('[Webhooks /larksuite] Responding to verification challenge');
      return res.status(200).json({ challenge: payload.challenge });
    }

    // 2. Parse standard Lark Event (Schema 2.0 usually has payload.header and payload.event)
    // The exact event type for email might be "mail.group.receive" or "im.message.receive_v1" depending on configuration
    const header = payload.header || {};
    const event = payload.event || {};
    
    console.log('[Webhooks /larksuite] Received event:', header.event_type);

    // If it's a message/email received event, extract the sender and subject
    // Note: The specific structure depends on which Lark API is subscribed, but we normalize it here.
    const senderEmail = event.sender?.sender_id?.email || event.from || '';
    const subject = event.message?.content || event.subject || 'Larksuite Message';
    const messageId = event.message?.message_id || event.message_id;

    if (!senderEmail) {
      console.log('[Webhooks /larksuite] Missing sender email, skipping attribution.');
      return res.status(200).send('OK');
    }

    let leadId = null;
    
    // Find lead by exact email match
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', senderEmail)
      .limit(1)
      .single();

    if (lead) leadId = lead.id;

    if (leadId) {
      // Log activity
      await supabase.from('interaction_history').insert([{
        lead_id: leadId,
        type: 'Email',
        content: \`Email/Message Received via Larksuite: \${subject}\`,
        metadata: { messageId, activity_type: 'email_received' }
      }]);
      console.log(\`[Webhooks /larksuite] Logged email_received activity for lead \${leadId}\`);
    } else {
      console.log(\`[Webhooks /larksuite] Sender \${senderEmail} did not match any lead.\`);
    }

    res.status(200).json({ code: 0, msg: "success" });
  } catch (error) {
    console.error('[Webhooks /larksuite] Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});
`;

file = file.replace(/\/\*\*\n \* GMAIL PUB\/SUB WEBHOOK \([\s\S]*?res\.status\(500\)\.send\('Internal Server Error'\);\n  \}\n\}\);/g, newRoute);

fs.writeFileSync('backend/routes/webhooks.cjs', file);
console.log('Replaced Gmail webhook with Larksuite webhook');
