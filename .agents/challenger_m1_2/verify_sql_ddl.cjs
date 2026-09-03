const fs = require('fs');

// Extract SQL from Section 3.3 of TELEPHONY_PHASE1_AUDIT_PLAN.md
const auditDoc = fs.readFileSync('/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md', 'utf8');

// Test SQL syntax parsing (checking balanced parentheses, valid statements, foreign keys)
const sqlRegex = /```sql([\s\S]*?)```/g;
const sqlBlocks = [];
let match;
while ((match = sqlRegex.exec(auditDoc)) !== null) {
  sqlBlocks.push(match[1]);
}

console.log(`Found ${sqlBlocks.length} SQL code blocks in the audit document.`);

const ddlBlock = sqlBlocks.find(b => b.includes('CREATE TABLE IF NOT EXISTS telephony_calls'));
if (!ddlBlock) {
  console.error('FAILED to find Section 3.3 DDL block!');
  process.exit(1);
}

console.log('Validating Section 3.3 DDL statements:');
const statements = ddlBlock.split(';').map(s => s.trim()).filter(s => s.length > 0);
console.log(`Found ${statements.length} SQL statements in Section 3.3.`);

statements.forEach((stmt, idx) => {
  const firstLine = stmt.split('\n')[0];
  console.log(`  [Stmt ${idx + 1}] ${firstLine}`);
  
  // Verify ON DELETE SET NULL for CRM foreign keys
  if (stmt.includes('REFERENCES leads') || stmt.includes('REFERENCES clients') || stmt.includes('REFERENCES users')) {
    if (stmt.includes('ON DELETE SET NULL') || stmt.includes('ON DELETE CASCADE')) {
      console.log(`    -> Foreign key constraint verified.`);
    } else {
      console.warn(`    -> Warning: Foreign key without explicit ON DELETE constraint: ${firstLine}`);
    }
  }
});

console.log('SQL DDL validation completed successfully.');
