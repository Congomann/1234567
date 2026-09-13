const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const carrierEndpoints = `
// --- CARRIERS API ---
app.get('/api/carriers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carriers ORDER BY category, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch carriers' });
  }
});

app.post('/api/carriers', async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await pool.query('INSERT INTO carriers (name, category) VALUES ($1, $2) RETURNING *', [name, category]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Carrier already exists' });
    res.status(500).json({ error: 'Failed to add carrier' });
  }
});
`;

if (!content.includes('/api/carriers')) {
  content = content.replace("// --- SERVE STATIC FRONTEND", carrierEndpoints + "\n// --- SERVE STATIC FRONTEND");
  fs.writeFileSync(path, content);
}
