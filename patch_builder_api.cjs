const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = `app.get('/api/contracting/queue', async (req, res) => {`;
const replacement = `app.get('/api/carriers/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM carrier_forms WHERE id = $1', [id]);
    res.json(result.rows[0] || { extracted_schema: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/carriers/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { extracted_schema } = req.body;
    const result = await pool.query(
      'UPDATE carrier_forms SET extracted_schema = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(extracted_schema), id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contracting/queue', async (req, res) => {`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
