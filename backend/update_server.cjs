const fs = require('fs');

const serverFile = 'backend/server.cjs';
let code = fs.readFileSync(serverFile, 'utf8');

const startIdx = code.indexOf("app.post('/api/leads', authenticateToken, async (req, res) => {");
const endIdx = code.indexOf("// 2.5 Public Lead Ingestion", startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find block bounds");
  process.exit(1);
}

const replacement = `
// ── UNIFIED MARKETING LEAD INGESTION ──────────────────────────────────────────
const normalizePhone = (p) => p ? p.replace(/\\D/g, '').slice(-10) : null;

app.post('/api/webhooks/ingest', async (req, res) => {
  try {
    const data = req.body;
    let { name, email, phone, interest, message, source, campaign_id, custom_details } = data;

    const utm_source = data.utm_source || null;
    const utm_medium = data.utm_medium || null;
    const utm_campaign = data.utm_campaign || data.campaign || null;
    const utm_term = data.utm_term || null;
    const utm_content = data.utm_content || null;
    const gclid = data.gclid || null;
    const fbclid = data.fbclid || null;
    const campaign = data.campaign || campaign_id || null;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and either email or phone required' });
    }

    const normPhone = normalizePhone(phone);
    const score = calculateLeadScore(req.body);
    const qualification = score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : 'Cold';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const dupRes = await client.query(
        "SELECT id FROM leads WHERE email = $1 OR (phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '\\\\D', '', 'g'), 10) = $2) LIMIT 1",
        [email, normPhone]
      );

      let leadId;
      if (dupRes.rows.length > 0) {
        leadId = dupRes.rows[0].id;
        await client.query(
          \`UPDATE leads SET updated_at = NOW(), score = $2, qualification = $3,
            utm_source = COALESCE($4, utm_source), utm_campaign = COALESCE($5, utm_campaign),
            gclid = COALESCE($6, gclid), fbclid = COALESCE($7, fbclid)
           WHERE id = $1\`,
          [leadId, score, qualification, utm_source, utm_campaign, gclid, fbclid]
        );
        await client.query(
          "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'duplicate_ingested', 'Duplicate lead ingestion received')",
          [leadId]
        );
      } else {
        const insertRes = await client.query(
          \`INSERT INTO leads (name, email, phone, interest, status, source, campaign, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, score, qualification, custom_details)
           VALUES ($1, $2, $3, $4, 'New', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *\`,
          [name, email, phone, interest, source, campaign, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, score, qualification, custom_details]
        );
        leadId = insertRes.rows[0].id;
        
        await client.query(
          "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'lead_created', 'Lead created via webhook')",
          [leadId]
        );
      }
      
      await client.query(
        "INSERT INTO webhook_events (provider, event_type, payload, processed) VALUES ($1, $2, $3, true)",
        [source || 'webhook', 'ingest', data]
      );
      
      await client.query('COMMIT');
      
      broadcast({ type: 'LEAD_INGESTED', leadId });
      
      res.status(200).json({ success: true, leadId });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const { id } = data;

    const normPhone = normalizePhone(data.phone);
    const score = calculateLeadScore(req.body);
    const qualification = score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : 'Cold';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let leadId = id;
      
      if (id) {
        await client.query(
          "UPDATE leads SET name=$1, email=$2, phone=$3, status=$4, updated_at=NOW() WHERE id=$5",
          [data.name, data.email, data.phone, data.status, id]
        );
        await client.query(
          "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'lead_updated', 'Lead updated via UI')",
          [id]
        );
      } else {
        const dupRes = await client.query(
          "SELECT id FROM leads WHERE email = $1 OR (phone IS NOT NULL AND RIGHT(REGEXP_REPLACE(phone, '\\\\D', '', 'g'), 10) = $2) LIMIT 1",
          [data.email, normPhone]
        );

        if (dupRes.rows.length > 0) {
          leadId = dupRes.rows[0].id;
          await client.query(
            "UPDATE leads SET updated_at = NOW() WHERE id = $1", [leadId]
          );
        } else {
          const insertRes = await client.query(
            "INSERT INTO leads (name, email, phone, status, source, score, qualification) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [data.name, data.email, data.phone, data.status || 'New', data.source || 'Web Form', score, qualification]
          );
          leadId = insertRes.rows[0].id;
          
          await client.query(
            "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'form_submitted', 'Form submitted via UI')",
            [leadId]
          );
        }
      }
      
      if (qualification === 'Hot') {
        await client.query(
          "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'qualified', 'Lead qualified as Hot')",
          [leadId]
        );
      }
      
      await client.query('COMMIT');
      
      broadcast({ type: 'LEAD_UPDATED', leadId });
      
      res.status(200).json({ success: true, leadId });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

`;

const newCode = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync(serverFile, newCode);
console.log("Patched server.cjs");
