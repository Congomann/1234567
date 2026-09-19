const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

// Ensure imap-simple and mailparser are available
if (!content.includes('const imaps = require(\'imap-simple\');')) {
  content = content.replace(
    'const crypto = require(\'crypto\');',
    'const crypto = require(\'crypto\');\nconst imaps = require(\'imap-simple\');\nconst simpleParser = require(\'mailparser\').simpleParser;'
  );
}

// Add the email sync endpoint before the contracting packages endpoint
const emailSyncCode = `
app.post('/api/contracting/email-sync', authenticateToken, async (req, res) => {
  try {
    const config = {
        imap: {
            user: 'sales@newhollandfinancial.com',
            password: 'SalesNew@2026',
            host: 'imap.larksuite.com',
            port: 993,
            tls: true,
            authTimeout: 5000
        }
    };
    
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');
    
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true, markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    let createdCount = 0;
    
    for (const item of messages) {
      const all = await connection.getPartsData(item, ['TEXT']);
      const headerPart = item.parts.find(p => p.which === 'HEADER');
      const textPart = item.parts.find(p => p.which === 'TEXT');
      
      let subject = 'Carrier Contracting';
      if (headerPart && headerPart.body && headerPart.body.subject) {
        subject = headerPart.body.subject[0];
      }
      
      let bodyString = textPart ? textPart.body : '';
      if (!bodyString) continue;
      
      const lowerBody = bodyString.toLowerCase();
      const lowerSubject = subject.toLowerCase();
      
      // Heuristic: Is it contracting related?
      if (lowerBody.includes('contracting') || lowerBody.includes('onboarding') || lowerBody.includes('appointment') || lowerSubject.includes('contracting')) {
        // Extract a URL (very simple regex for http/https)
        const urlRegex = /(https?:\\/\\/[^\\s"'<>]+)/g;
        const urls = bodyString.match(urlRegex);
        
        if (urls && urls.length > 0) {
          const contractingUrl = urls[0]; // Take the first URL found
          
          // Guess carrier name from subject (e.g., "Welcome to Protective Life Contracting")
          let carrierName = 'External Carrier';
          const carrierWords = subject.split(' ').slice(0, 3).join(' '); // Rough guess
          if (subject.length > 5) carrierName = subject.replace(/contracting|onboarding|appointment/ig, '').trim();
          
          // Create the carrier_packages table if not exists
          await pool.query(\`
            CREATE TABLE IF NOT EXISTS carrier_packages (
              id SERIAL PRIMARY KEY,
              carrier_name VARCHAR(255),
              package_name VARCHAR(255),
              eligibility TEXT,
              states JSONB,
              availability VARCHAR(50),
              version VARCHAR(50),
              created_at TIMESTAMP DEFAULT NOW()
            )
          \`);
          
          // Insert it as an external link package
          await pool.query(
            'INSERT INTO carrier_packages (carrier_name, package_name, eligibility, states, availability, version) VALUES ($1, $2, $3, $4, $5, $6)',
            [carrierName.substring(0, 50), 'External Contracting Link', contractingUrl, JSON.stringify([]), 'Available', 'EXTERNAL_URL']
          );
          
          createdCount++;
        }
      }
    }
    
    connection.end();
    res.json({ success: true, processed: createdCount, totalScanned: messages.length });
  } catch (err) {
    console.error('Email sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contracting/packages'`;

if (!content.includes('/api/contracting/email-sync')) {
  content = content.replace("app.post('/api/contracting/packages'", emailSyncCode);
}

fs.writeFileSync('backend/server.cjs', content);
console.log('Patched backend with email sync endpoint.');
