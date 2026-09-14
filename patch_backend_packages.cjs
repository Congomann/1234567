const fs = require('fs');
let server = fs.readFileSync('backend/server.cjs', 'utf8');

const packageRoutes = `
// --- CARRIER PACKAGES API ---
app.post('/api/contracting/packages', authenticateToken, async (req, res) => {
  try {
    const { carrier_name, package_name, eligibility, states, availability, version } = req.body;
    await query(\`
      CREATE TABLE IF NOT EXISTS carrier_packages (
        id SERIAL PRIMARY KEY,
        carrier_name VARCHAR(255),
        package_name VARCHAR(255),
        eligibility VARCHAR(255),
        states JSONB,
        availability VARCHAR(50),
        version VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    \`);
    const result = await query(
      'INSERT INTO carrier_packages (carrier_name, package_name, eligibility, states, availability, version) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [carrier_name, package_name, eligibility, JSON.stringify(states), availability, version]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

app.get('/api/contracting/packages', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM carrier_packages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    // If table doesn't exist yet, return empty array
    if (err.code === '42P01') {
      res.json([]);
    } else {
      res.status(500).json({ error: 'Failed to fetch packages' });
    }
  }
});

// For submissions autosave/progress tracking
app.post('/api/contracting/submissions/autosave', authenticateToken, async (req, res) => {
  try {
    const { package_id, carrier_name, form_values, status, progress } = req.body;
    
    // Check if submission exists
    const existing = await query(
      'SELECT id FROM carriers_submissions WHERE user_id = $1 AND package_id = $2',
      [req.user.id, package_id]
    );
    
    if (existing.rows.length > 0) {
      await query(
        'UPDATE carriers_submissions SET data = $1, status = $2, progress = $3, updated_at = NOW() WHERE id = $4',
        [JSON.stringify(form_values), status, progress, existing.rows[0].id]
      );
      res.json({ id: existing.rows[0].id });
    } else {
      const result = await query(
        'INSERT INTO carriers_submissions (carrier_name, user_id, package_id, status, progress, data, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
        [carrier_name, req.user.id, package_id, status, progress, JSON.stringify(form_values)]
      );
      res.json({ id: result.rows[0].id });
    }
  } catch (err) {
    console.error('Autosave error', err);
    // Ignore if table missing schema column (we can patch the table if needed)
    res.status(500).json({ error: 'Failed to autosave' });
  }
});
`;

if (!server.includes('/api/contracting/packages')) {
  server = server.replace('// --- CONTRACTING & SUBMISSIONS API ---', '// --- CONTRACTING & SUBMISSIONS API ---\n' + packageRoutes);
  fs.writeFileSync('backend/server.cjs', server);
  console.log('Patched backend with package routes');
} else {
  console.log('Already patched');
}
