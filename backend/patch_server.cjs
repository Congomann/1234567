const fs = require('fs');

let server = fs.readFileSync('backend/server.cjs', 'utf-8');

server = server.replace(
  "id, name, email, phone, street, city, state, zip, policyNumber, premium, product, renewalDate, commissionAmount, carrier",
  "id, name, email, phone, street, city, state, zip, policyNumber, premium, product, renewalDate, commissionAmount, carrier, missedPayments, birthday, status, coverageAmount, policyDuration"
);

server = server.replace(
  "policy_number, premium, product, renewal_date, commission_amount, carrier, created_at)",
  "policy_number, premium, product, renewal_date, commission_amount, carrier, missed_payments, birthday, status, coverage_amount, policy_duration_months, created_at)"
);

server = server.replace(
  "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)",
  "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)"
);

server = server.replace(
  "policy_number=$7, premium=$8, product=$9, renewal_date=$10, commission_amount=$11, carrier=$12`,",
  "policy_number=$7, premium=$8, product=$9, renewal_date=$10, commission_amount=$11, carrier=$12, missed_payments=$13, birthday=$14, status=$15, coverage_amount=$16, policy_duration_months=$17`,"
);

server = server.replace(
  "[clientId, req.user.id, name, email, phone, addressJson, policyNumber, premium || 0, product, renewalDate, commissionAmount || 0, carrier]",
  "[clientId, req.user.id, name, email, phone, addressJson, policyNumber, premium || 0, product, renewalDate, commissionAmount || 0, carrier, missedPayments || 0, birthday || null, status || 'Active', coverageAmount || 0, policyDuration || 0]"
);

// Also need to fetch these fields in GET /api/clients
server = server.replace(
  "SELECT id, name, email, phone, address, policy_number, premium, product, renewal_date, commission_amount, carrier FROM clients",
  "SELECT id, name, email, phone, address, policy_number, premium, product, renewal_date, commission_amount, carrier, missed_payments, birthday, status, coverage_amount, policy_duration_months FROM clients"
);

// Add the carrier routes
const carrierRoutes = `
// ── Carrier API Integrations (Mocked) ──────────────────────────────────────────────
app.post('/api/carrier/sync', authenticateToken, async (req, res) => {
  try {
    const { carrierId, scenario, clientId, clientName, clientEmail, policyNumber, basePremium } = req.body;
    
    // Simulate network latency
    await new Promise(r => setTimeout(r, 450));
    
    let rawPayload = {};
    if (carrierId === 'acme-mutual') {
      const statusMap = { active: 'IN_FORCE', grace_period: 'GRACE_PERIOD', lapsed: 'LAPSED' };
      rawPayload = {
        carrier_code: 'ACME_MUTUAL_LIFE',
        contract_id: policyNumber.startsWith('ACM-') ? policyNumber : \`ACM-\${policyNumber}\`,
        insured_party: {
          full_legal_name: clientName || 'Jane Doe',
          dob: '1983-05-14',
          contact_email: clientEmail || 'jane.doe@example.com'
        },
        policy_details: {
          plan_code: 'TERM_20_PREMIER',
          policy_status: statusMap[scenario] || 'IN_FORCE',
          issue_date: '2021/04/15',
          expiry_date: '2041/04/15',
          term_years: 20,
          renewable_flag: true
        },
        coverage: {
          face_amount_cents: 50000000
        },
        billing: {
          modal_premium_cents: Math.round((basePremium || 2400) * 100),
          frequency: 'ANNUAL',
          past_due_installments: scenario === 'grace_period' ? 1 : scenario === 'lapsed' ? 3 : 0,
          past_due_cents: scenario === 'grace_period' ? Math.round((basePremium || 2400) * 100) : scenario === 'lapsed' ? Math.round((basePremium || 2400) * 3 * 100) : 0,
          last_unpaid_due_date: scenario !== 'active' ? '2026-08-01' : undefined,
          grace_period_end: scenario === 'grace_period' ? '2026-09-18' : undefined
        }
      };
    } else {
      const statusMap = { active: 'CURRENT', grace_period: 'PAYMENT_PENDING', lapsed: 'TERMINATED' };
      rawPayload = {
        provider: 'ApexLife InsurTech',
        policyId: policyNumber.startsWith('APX-') ? policyNumber : \`APX-\${policyNumber}\`,
        customer: {
          name: clientName || 'Jane Doe',
          birthDate: '1979-11-28T00:00:00.000Z',
          email: clientEmail || 'jane.doe@example.com',
          phone: '+1 (555) 723-9914'
        },
        state: statusMap[scenario] || 'CURRENT',
        planType: 'Apex Universal Life Plus',
        benefitAmount: 750000.00,
        periodicRate: Math.round(((basePremium || 2400) / 12) * 100) / 100,
        billingSchedule: 'monthly',
        inceptionDate: '2022-02-01T00:00:00.000Z',
        expirationDate: '2052-02-01T00:00:00.000Z',
        termYears: 30,
        renewable: true,
        delinquentPayments: scenario === 'grace_period' ? 1 : scenario === 'lapsed' ? 3 : 0,
        totalPastDue: scenario === 'grace_period' ? Math.round(((basePremium || 2400) / 12) * 100) / 100 : scenario === 'lapsed' ? Math.round(((basePremium || 2400) / 12 * 3) * 100) / 100 : 0.00,
        lastPaymentFailureDate: scenario !== 'active' ? '2026-08-05T00:00:00.000Z' : undefined,
        gracePeriodEnd: scenario === 'grace_period' ? '2026-09-22T00:00:00.000Z' : undefined
      };
    }
    
    res.json({ success: true, rawPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
`;

if (!server.includes('/api/carrier/sync')) {
  server = server.replace(
    "// ── Integrations (Facebook, Google, TikTok, LinkedIn) ────────────────────────",
    carrierRoutes + "\n\n// ── Integrations (Facebook, Google, TikTok, LinkedIn) ────────────────────────"
  );
}

fs.writeFileSync('backend/server.cjs', server, 'utf-8');
console.log('Patched server.cjs');
