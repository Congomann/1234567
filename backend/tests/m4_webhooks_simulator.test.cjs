const { test, describe, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('node:child_process');
const path = require('node:path');

const webhooksRouter = require('../routes/webhooks.cjs');
const {
  generateMockLead,
  sendLeadPayload,
  startSimulator,
  stopSimulator,
  getStats,
  resetStats
} = require('../scripts/adSimulator.cjs');

describe('Milestone M4: Ad Campaign Webhook & Simulator Suite', () => {
  let app;
  let server;
  let baseUrl;
  let port;

  before(async () => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api/webhooks', webhooksRouter);

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('POST /api/webhooks/campaigns - Valid Ingestion', () => {
    test('successfully ingests Meta ad lead payload', async () => {
      const payload = {
        channel: 'meta',
        campaign_id: 'cmp_meta_wealth_2026',
        lead: {
          full_name: 'Alexander Anderson',
          email: 'alexander.anderson@example.com',
          phone: '+15551234567',
          annual_income: 120000,
          asset_volume: 450000,
          credit_score: 740
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(typeof data.lead_id, 'string');
      assert.ok(data.lead_id.length > 0);
      assert.equal(data.status, 'received');
    });

    test('successfully ingests Google ad lead payload (accepting case-insensitive channel "Google")', async () => {
      const payload = {
        channel: 'Google',
        campaign_id: 'cmp_goog_jumbo_leads',
        lead: {
          full_name: 'Beatrice Brooks',
          email: 'beatrice.b@example.org',
          phone: '+15559876543',
          annual_income: 250000,
          asset_volume: 1200000,
          credit_score: 800
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(typeof data.lead_id, 'string');
      assert.equal(data.status, 'received');
    });

    test('successfully ingests TV ad lead payload (accepting "name" alias for "full_name")', async () => {
      const payload = {
        channel: 'TV',
        campaign_id: 'cmp_tv_prime_news',
        lead: {
          name: 'Charles Campbell',
          email: 'charles.campbell@example.net',
          phone: '+15554567890',
          annual_income: 95000,
          asset_volume: 350000,
          credit_score: 710
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.status, 'received');
    });
  });

  describe('POST /api/webhooks/campaigns - Payload Validation Errors (HTTP 400)', () => {
    test('returns 400 if channel is missing', async () => {
      const payload = {
        campaign_id: 'cmp_123',
        lead: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+15550000000',
          annual_income: 100000,
          asset_volume: 200000,
          credit_score: 700
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /channel/i);
    });

    test('returns 400 if channel is invalid (e.g. tiktok)', async () => {
      const payload = {
        channel: 'tiktok',
        campaign_id: 'cmp_123',
        lead: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+15550000000',
          annual_income: 100000,
          asset_volume: 200000,
          credit_score: 700
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /channel/i);
    });

    test('returns 400 if campaign_id is missing or empty string', async () => {
      const payload = {
        channel: 'meta',
        campaign_id: '   ',
        lead: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+15550000000',
          annual_income: 100000,
          asset_volume: 200000,
          credit_score: 700
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /campaign_id/i);
    });

    test('returns 400 if lead is missing or not an object', async () => {
      const payload = {
        channel: 'meta',
        campaign_id: 'cmp_123',
        lead: null
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /lead/i);
    });

    test('returns 400 if lead.full_name is missing or empty', async () => {
      const payload = {
        channel: 'meta',
        campaign_id: 'cmp_123',
        lead: {
          full_name: '',
          email: 'john@example.com',
          phone: '+15550000000',
          annual_income: 100000,
          asset_volume: 200000,
          credit_score: 700
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /full_name/i);
    });

    test('returns 400 if lead.email format is invalid', async () => {
      const payload = {
        channel: 'meta',
        campaign_id: 'cmp_123',
        lead: {
          full_name: 'John Doe',
          email: 'invalid-email-address',
          phone: '+15550000000',
          annual_income: 100000,
          asset_volume: 200000,
          credit_score: 700
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /email/i);
    });

    test('returns 400 if lead.phone is missing or empty', async () => {
      const payload = {
        channel: 'meta',
        campaign_id: 'cmp_123',
        lead: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '   ',
          annual_income: 100000,
          asset_volume: 200000,
          credit_score: 700
        }
      };

      const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /phone/i);
    });

    test('returns 400 if lead.annual_income is negative or non-numeric', async () => {
      const invalidIncomes = [-1, 'invalid', null, true];

      for (const inc of invalidIncomes) {
        const payload = {
          channel: 'meta',
          campaign_id: 'cmp_123',
          lead: {
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+15550000000',
            annual_income: inc,
            asset_volume: 200000,
            credit_score: 700
          }
        };

        const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        assert.equal(res.status, 400, `Expected 400 for annual_income=${inc}`);
        const data = await res.json();
        assert.equal(data.success, false);
        assert.match(data.error, /annual_income/i);
      }
    });

    test('returns 400 if lead.asset_volume is negative or non-numeric', async () => {
      const invalidAssets = [-500, 'nan', null, false];

      for (const asset of invalidAssets) {
        const payload = {
          channel: 'meta',
          campaign_id: 'cmp_123',
          lead: {
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+15550000000',
            annual_income: 100000,
            asset_volume: asset,
            credit_score: 700
          }
        };

        const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        assert.equal(res.status, 400, `Expected 400 for asset_volume=${asset}`);
        const data = await res.json();
        assert.equal(data.success, false);
        assert.match(data.error, /asset_volume/i);
      }
    });

    test('returns 400 if lead.credit_score is out of standard FICO range (300-850)', async () => {
      const invalidScores = [299, 851, -1, 'bad_score', null];

      for (const score of invalidScores) {
        const payload = {
          channel: 'meta',
          campaign_id: 'cmp_123',
          lead: {
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+15550000000',
            annual_income: 100000,
            asset_volume: 200000,
            credit_score: score
          }
        };

        const res = await fetch(`${baseUrl}/api/webhooks/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        assert.equal(res.status, 400, `Expected 400 for credit_score=${score}`);
        const data = await res.json();
        assert.equal(data.success, false);
        assert.match(data.error, /credit_score/i);
      }
    });
  });

  describe('Ad Lead Simulator Component (adSimulator.cjs)', () => {
    beforeEach(() => {
      resetStats();
      stopSimulator();
    });

    afterEach(() => {
      stopSimulator();
    });

    test('generateMockLead produces valid payloads for meta, google, and tv', () => {
      const channels = ['meta', 'google', 'tv'];
      for (const ch of channels) {
        const leadPayload = generateMockLead(ch);
        assert.equal(leadPayload.channel, ch);
        assert.ok(typeof leadPayload.campaign_id === 'string' && leadPayload.campaign_id.length > 0);
        assert.ok(typeof leadPayload.lead.full_name === 'string' && leadPayload.lead.full_name.length > 0);
        assert.match(leadPayload.lead.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        assert.ok(typeof leadPayload.lead.phone === 'string' && leadPayload.lead.phone.length > 0);
        assert.ok(leadPayload.lead.annual_income >= 0);
        assert.ok(leadPayload.lead.asset_volume >= 0);
        assert.ok(leadPayload.lead.credit_score >= 300 && leadPayload.lead.credit_score <= 850);
      }
    });

    test('sendLeadPayload successfully posts to target endpoint', async () => {
      const mockLead = generateMockLead('meta');
      const result = await sendLeadPayload(mockLead, `${baseUrl}/api/webhooks/campaigns`);
      assert.equal(result.success, true);
      assert.equal(result.data.success, true);
      assert.equal(result.data.status, 'received');
      assert.ok(result.data.lead_id);
    });

    test('startSimulator and stopSimulator manage background streaming loop correctly', async () => {
      startSimulator({
        targetUrl: `${baseUrl}/api/webhooks/campaigns`,
        intervalMs: 150,
        initialDelayMs: 20
      });

      const statsInitial = getStats();
      assert.equal(statsInitial.isRunning, true);

      // Wait for 500ms to allow a couple of dispatches
      await new Promise(r => setTimeout(r, 500));

      const statsRunning = getStats();
      assert.ok(statsRunning.totalSent >= 2, `Expected totalSent >= 2, got ${statsRunning.totalSent}`);
      assert.equal(statsRunning.totalSuccess, statsRunning.totalSent);

      stopSimulator();
      const statsStopped = getStats();
      assert.equal(statsStopped.isRunning, false);
    });

    test('CLI execution via --once flag delivers lead and exits with code 0', () => {
      const scriptPath = path.join(__dirname, '../scripts/adSimulator.cjs');
      const cmd = `node "${scriptPath}" --once --target="${baseUrl}/api/webhooks/campaigns"`;
      const output = execSync(cmd).toString();
      assert.match(output, /Webhook accepted/i);
    });
  });
});
