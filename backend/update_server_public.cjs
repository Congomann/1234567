const fs = require('fs');

const serverFile = 'backend/server.cjs';
let code = fs.readFileSync(serverFile, 'utf8');

const startIdx = code.indexOf("app.post('/api/leads/public'");
const endIdx = code.indexOf("// 3.", startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find block bounds");
  process.exit(1);
}

const replacement = `app.post('/api/leads/public', async (req, res) => {
  const { name, email, phone, interest, message, source, visitorId, customDetails } = req.body;
  
  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name and either email or phone required' });
  }

  try {
    const score = calculateLeadScore(req.body);
    const qualification = score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : 'Cold';
    const normPhone = phone ? phone.replace(/\\D/g, '').slice(-10) : null;

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
          "UPDATE leads SET updated_at = NOW(), score = $2, qualification = $3, message = $4 WHERE id = $1",
          [leadId, score, qualification, message]
        );
        await client.query(
          "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'duplicate_ingested', 'Duplicate form submission received')",
          [leadId]
        );
      } else {
        const insertRes = await client.query(
          \`INSERT INTO leads (name, email, phone, interest, message, source, visitor_id, score, qualification, status, custom_details)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'New', $10) RETURNING *\`,
          [name, email, phone, interest || 'General', message, source || 'Web Form', visitorId, score, qualification, customDetails]
        );
        leadId = insertRes.rows[0].id;
        
        await client.query(
          "INSERT INTO lead_activities (lead_id, activity_type, description) VALUES ($1, 'form_submitted', 'Form submitted via public UI')",
          [leadId]
        );
      }
      
      await client.query('COMMIT');
      
      // SSE / WebSockets Broadcast
      if (typeof broadcast === 'function') {
        broadcast({ type: 'NEW_LEAD', leadId });
      }
      
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
console.log("Patched server.cjs for public leads");
