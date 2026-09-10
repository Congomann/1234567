const fs = require('fs');
let file = fs.readFileSync('backend/server.cjs', 'utf8');

const oldRoute = `app.post('/api/public/book', async (req, res) => {
  try {
    const { advisorId, name, email, date, time, endTime } = req.body;
    
    const advisorRes = await pool.query('SELECT name FROM users WHERE id = $1', [advisorId]);
    const advisorName = advisorRes.rows[0]?.name || 'Advisor';

    const eventId = crypto.randomUUID();
    await pool.query(\`
      INSERT INTO events (id, creator_id, creator_name, title, date, time, end_time, type, status, description, participants, visibility)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'meeting', 'Upcoming', $8, $9, 'public')
    \`, [
      eventId, 
      advisorId, 
      advisorName, 
      \`Client Meeting: \${name}\`, 
      date, 
      time, 
      endTime, 
      \`Booked via Public Portal by \${email}\`,
      JSON.stringify([{ name, email }])
    ]);

    res.json({ success: true, eventId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

const newRoute = `app.post('/api/public/book', async (req, res) => {
  try {
    const { advisorId, name, email, date, time, endTime } = req.body;
    
    const advisorRes = await pool.query('SELECT name FROM users WHERE id = $1', [advisorId]);
    const advisorName = advisorRes.rows[0]?.name || 'Advisor';

    const eventId = crypto.randomUUID();
    const meetingLink = \`https://meet.jit.si/NHFG-\${eventId}\`;
    
    await pool.query(\`
      INSERT INTO events (id, creator_id, creator_name, title, date, time, end_time, type, status, description, participants, visibility, has_google_meet, meeting_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'meeting', 'Upcoming', $8, $9, 'public', true, $10)
    \`, [
      eventId, 
      advisorId, 
      advisorName, 
      \`Client Meeting: \${name}\`, 
      date, 
      time, 
      endTime, 
      \`Booked via Public Portal by \${email}\`,
      JSON.stringify([{ name, email }]),
      meetingLink
    ]);

    res.json({ success: true, eventId, meetingLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

file = file.replace(oldRoute, newRoute);
fs.writeFileSync('backend/server.cjs', file);
console.log('Updated backend server route');
