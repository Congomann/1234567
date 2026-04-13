const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const supabase = require('../supabaseClient.cjs');

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'production'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(plaidConfig);

function calculateRisk(balance, transactions) {
  const last30Days = transactions.filter(tx =>
    new Date(tx.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  // Note: Plaid amounts are positive for spending, negative for income.
  const spend = last30Days
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const income = last30Days
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  if (balance > 1000 && income > spend) return 'Green';
  if (balance > 300) return 'Yellow';
  return 'Red';
}

async function syncFinancialData(user_id, access_token) {
  try {
    console.log(`[Plaid Sync] Starting sync for user: ${user_id}`);
    
    // 1. BALANCE
    const balanceRes = await plaidClient.accountsBalanceGet({ access_token });
    const accounts = balanceRes.data.accounts;
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balances.available || acc.balances.current || 0), 0);
    
    // UPSERT directly into our balances table
    // Using a select then update/insert logic if no upsert conflict constraint is defined
    const { data: existingBalance } = await supabase.from('balances').select('id').eq('user_id', user_id).single();
    if (existingBalance) {
      await supabase.from('balances').update({ current_balance: totalBalance, last_updated: new Date() }).eq('id', existingBalance.id);
    } else {
      await supabase.from('balances').insert({ user_id, current_balance: totalBalance, last_updated: new Date() });
    }

    // 2. TRANSACTIONS
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // Pull last 90 days
    const formattedStart = startDate.toISOString().split('T')[0];
    const formattedEnd = new Date().toISOString().split('T')[0];

    const txRes = await plaidClient.transactionsGet({
      access_token,
      start_date: formattedStart,
      end_date: formattedEnd,
    });

    const transactions = txRes.data.transactions.map(tx => ({
      user_id,
      amount: tx.amount,
      name: tx.name,
      category: tx.category?.[0] || 'Uncategorized',
      date: tx.date,
    }));

    // Clear old ones and insert new
    await supabase.from('transactions_plaid').delete().eq('user_id', user_id);
    if (transactions.length > 0) {
      await supabase.from('transactions_plaid').insert(transactions);
    }

    // 3. RISK SCORE
    const score = calculateRisk(totalBalance, transactions);

    const { data: existingRisk } = await supabase.from('risk_scores').select('id').eq('user_id', user_id).single();
    if (existingRisk) {
      await supabase.from('risk_scores').update({ score, updated_at: new Date() }).eq('id', existingRisk.id);
    } else {
      await supabase.from('risk_scores').insert({ user_id, score, updated_at: new Date() });
    }

    console.log(`[Plaid Sync] Complete for user: ${user_id} | Risk: ${score}`);
    return { balance: totalBalance, score, count: transactions.length };
  } catch (error) {
    console.error(`[Plaid Sync] Error syncing data for ${user_id}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { syncFinancialData, calculateRisk };
