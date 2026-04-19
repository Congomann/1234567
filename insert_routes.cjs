const fs = require('fs');

const routes = `
// ════════════════════════════════════════════════════════════════════════════════
// ─── CLIENTS ENGINE ─────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const {
      id, name, email, phone, street, city, state, zip, policyNumber, premium, product, renewalDate, commissionAmount, carrier
    } = req.body;
    
    const clientId = id || require('crypto').randomUUID();
    const addressJson = JSON.stringify({ street, city, state, zip });
    
    await pool.query(
      \`INSERT INTO clients (id, advisor_id, name, email, phone, address, policy_number, premium, product, renewal_date, commission_amount, carrier, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET 
         name=$3, email=$4, phone=$5, address=$6, policy_number=$7, premium=$8, product=$9, renewal_date=$10, commission_amount=$11, carrier=$12\`,
      [clientId, req.user.id, name, email, phone, addressJson, policyNumber, premium || 0, product, renewalDate, commissionAmount || 0, carrier]
    );
    res.json({ success: true, id: clientId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ─── TASKS ENGINE ───────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE advisor_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { id, title, priority, completed, dueDate, advisorId, description } = req.body;
    const taskId = id || require('crypto').randomUUID();
    
    await pool.query(
      \`INSERT INTO tasks (id, advisor_id, title, description, priority, completed, due_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET 
         title=$3, description=$4, priority=$5, completed=$6, due_date=$7\`,
      [taskId, advisorId || req.user.id, title, description, priority || 'Medium', completed || false, dueDate]
    );
    res.json({ success: true, id: taskId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ─── PORTFOLIOS ENGINE ──────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/portfolios', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM portfolios WHERE advisor_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/portfolios', authenticateToken, async (req, res) => {
  try {
    const { id, clientName, totalValue, ytdReturn, riskProfile, holdings, advisorId } = req.body;
    const portId = id || require('crypto').randomUUID();
    
    await pool.query(
      \`INSERT INTO portfolios (id, advisor_id, client_name, total_value, ytd_return, risk_profile, holdings, last_rebalanced, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET 
         client_name=$3, total_value=$4, ytd_return=$5, risk_profile=$6, holdings=$7, last_rebalanced=CURRENT_TIMESTAMP\`,
      [portId, advisorId || req.user.id, clientName, totalValue || 0, ytdReturn || 0, riskProfile || 'Moderate', JSON.stringify(holdings || [])]
    );
    res.json({ success: true, id: portId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/portfolios/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM portfolios WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════════
// ─── APPLICATIONS ENGINE (Policies) ─────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM applications");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    const { id, leadId, clientName, carrier, policyNumber, status, premium } = req.body;
    const appId = id || require('crypto').randomUUID();
    
    await pool.query(
      \`INSERT INTO applications (id, lead_id, advisor_id, client_name, carrier, policy_number, status, premium, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET 
         lead_id=$2, client_name=$4, carrier=$5, policy_number=$6, status=$7, premium=$8\`,
      [appId, leadId, req.user.id, clientName, carrier, policyNumber, status || 'Pending', premium || 0]
    );
    res.json({ success: true, id: appId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

let content = fs.readFileSync('backend/server.cjs', 'utf8');
content = content.replace(/server\.listen\(PORT, \(\) => {/g, routes + '\n\nserver.listen(PORT, () => {');
fs.writeFileSync('backend/server.cjs', content);
console.log("Injected API routes before server.listen!");
