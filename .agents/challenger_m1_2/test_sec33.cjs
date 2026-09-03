const fs = require('fs');

const auditDoc = fs.readFileSync('/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md', 'utf8');

// Find section 3.3
const sec33Idx = auditDoc.indexOf('### 3.3 Enhanced Telephony Database Schema');
const sec34Idx = auditDoc.indexOf('### 3.4 WebRTC Browser Softphone');

const sec33Text = auditDoc.substring(sec33Idx, sec34Idx);
const sqlMatch = sec33Text.match(/```sql([\s\S]*?)```/);

if (sqlMatch) {
  const sql = sqlMatch[1];
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  console.log(`Found ${statements.length} SQL statements in Section 3.3:`);
  statements.forEach((s, i) => {
    const header = s.split('\n').filter(l => !l.startsWith('--') && l.trim().length > 0)[0];
    console.log(`  ${i+1}. ${header}`);
  });
} else {
  console.error('No SQL block found in Section 3.3!');
}
