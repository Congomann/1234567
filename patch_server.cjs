const fs = require('fs');
let file = fs.readFileSync('backend/server.cjs', 'utf8');

const tableInit = `
    await pool.query('CREATE TABLE IF NOT EXISTS bank_accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID, institution_name VARCHAR(255), account_name VARCHAR(255), mask VARCHAR(10), type VARCHAR(50), balance DECIMAL, last_synced TIMESTAMPTZ, status VARCHAR(20) DEFAULT \\'active\\')').catch(console.error);
    await pool.query('CREATE TABLE IF NOT EXISTS bank_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bank_account_id UUID, date DATE, merchant VARCHAR(255), amount DECIMAL, category VARCHAR(255), status VARCHAR(20) DEFAULT \\'pending\\', journal_entry_id UUID)').catch(console.error);
`;

const routes = `
// Accounting
app.get('/api/accounting/accounts', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM bank_accounts');
        res.json(rows);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/accounting/transactions', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM bank_transactions ORDER BY date DESC');
        res.json(rows);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/accounting/reconcile', async (req, res) => {
    try {
        const { txId, category, journalEntryId } = req.body;
        await pool.query('UPDATE bank_transactions SET status = \\'reconciled\\', category = $1, journal_entry_id = $2 WHERE id = $3', [category, journalEntryId, txId]);
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});
`;

file = file.replace(/await pool\.query\('CREATE TABLE IF NOT EXISTS analytics_visitors[^]*?;\n/, match => match + tableInit);
file = file.replace(/app\.listen\(/, match => routes + '\n' + match);

fs.writeFileSync('backend/server.cjs', file);
