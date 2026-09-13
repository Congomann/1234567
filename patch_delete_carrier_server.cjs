const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

const deleteEndpoint = `
app.delete('/api/carriers/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM carriers WHERE name = $1', [name]);
    if (rowCount === 0) return res.status(404).json({ error: 'Carrier not found' });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete carrier' });
  }
});
`;

if (!content.includes('app.delete(\'/api/carriers/:name\'')) {
  content = content.replace("app.post('/api/carriers', async (req, res) => {", deleteEndpoint + "\napp.post('/api/carriers', async (req, res) => {");
  fs.writeFileSync(path, content);
}
