const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

// 1. Add ALTER TABLE
const initTarget = `CREATE TABLE IF NOT EXISTS carriers (`;
const initReplacement = `ALTER TABLE carriers ADD COLUMN IF NOT EXISTS paperwork_file_name VARCHAR(255);\n      CREATE TABLE IF NOT EXISTS carriers (`;
content = content.replace(initTarget, initReplacement);

// 2. Update POST /api/carriers
const postTarget = `app.post('/api/carriers', async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await pool.query('INSERT INTO carriers (name, category) VALUES ($1, $2) RETURNING *', [name, category]);
    res.status(201).json(rows[0]);`;

const postReplacement = `app.post('/api/carriers', async (req, res) => {
  const { name, category, paperworkFileName } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await pool.query('INSERT INTO carriers (name, category, paperwork_file_name) VALUES ($1, $2, $3) RETURNING *', [name, category, paperworkFileName]);
    const carrier = rows[0];
    carrier.paperworkFileName = carrier.paperwork_file_name;
    res.status(201).json(carrier);`;
content = content.replace(postTarget, postReplacement);

// 3. Update GET /api/carriers
const getTarget = `app.get('/api/carriers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carriers ORDER BY category, name');
    res.json(rows);`;
const getReplacement = `app.get('/api/carriers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM carriers ORDER BY category, name');
    const mapped = rows.map(r => ({ ...r, paperworkFileName: r.paperwork_file_name }));
    res.json(mapped);`;
content = content.replace(getTarget, getReplacement);

fs.writeFileSync('backend/server.cjs', content);
console.log('Patched server.cjs');
