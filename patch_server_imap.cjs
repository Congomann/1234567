const fs = require('fs');
const path = './backend/server.cjs';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Queue endpoint
const endpointTarget = `app.post('/api/contracting/submissions', async (req, res) => {`;
const endpointReplacement = `app.get('/api/contracting/queue', async (req, res) => {
  try {
    const result = await pool.query(\`
      SELECT q.*, m.subject, m.from_email 
      FROM admin_review_queue q 
      JOIN mailbox_messages m ON q.mailbox_message_id = m.id 
      WHERE q.status = 'PENDING'
      ORDER BY q.created_at DESC
    \`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contracting/submissions', async (req, res) => {`;
content = content.replace(endpointTarget, endpointReplacement);

// 2. Start IMAP on boot
const bootTarget = `app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`;
const bootReplacement = `const { startMailMonitor } = require('./services/imapMonitor.cjs');
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
  // Start the Inbox Monitor for Carrier Automation
  startMailMonitor();
});`;
content = content.replace(bootTarget, bootReplacement);

fs.writeFileSync(path, content);
