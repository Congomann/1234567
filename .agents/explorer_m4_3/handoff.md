# Handoff Report — Explorer 3 (Milestone 4: Automated Ad Lead Simulator Architecture & Integration)

## 1. Observation

### 1.1 Webhook & Server Setup
- **File:** `/Users/newholland/1234567/backend/server.cjs`
  - **Line 19:** `const webhooksRouter = require('./routes/webhooks.cjs');`
  - **Line 133:** `app.use('/api/webhooks', webhooksRouter);`
  - **Lines 5528-5532:**
    ```javascript
    if (require.main === module) {
      server.listen(PORT, () => {
        console.log(`NHFG CRM API Server running on port ${PORT}`);
      });
    }
    ```
- **File:** `/Users/newholland/1234567/.agents/explorer_m4_1/handoff.md`
  - Explored and provided the concrete implementation for `POST /api/webhooks/campaigns` in `backend/routes/webhooks.cjs`, which parses `channel`, `campaign_id`, and `lead` (`full_name`, `email`, `phone`, `annual_income`, `asset_volume`, `credit_score`), maps them into the `leads` table, and returns `{ success: true, lead_id: uuid, status: 'received' }`.

### 1.2 Webhook Interface & Payload Contract
- **Files:** `/Users/newholland/1234567/PROJECT.md` (Lines 45-50) & `/Users/newholland/1234567/.agents/sub_orch_m4/SCOPE.md` (Lines 20-26)
  - **Endpoint:** `POST /api/webhooks/campaigns`
  - **Headers:** `Content-Type: application/json`
  - **Request Body Contract:**
    ```json
    {
      "channel": "meta" | "google" | "tv",
      "campaign_id": "string",
      "lead": {
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "annual_income": number,
        "asset_volume": number,
        "credit_score": number
      }
    }
    ```
  - **Expected Success Response:**
    ```json
    {
      "success": true,
      "lead_id": "uuid-string",
      "status": "received"
    }
    ```

### 1.3 Project Environment & Dependencies
- **File:** `/Users/newholland/1234567/package.json`
  - Node version support: Standard modern Node.js environment (v18+/v20+ with native `fetch` support).
  - Existing scripts: `"server:local": "node backend/server.cjs"`.
  - Non-existent file: `backend/scripts/adSimulator.cjs` does not exist yet and needs to be created.

---

## 2. Logic Chain

1. **Simulator Execution Architecture (Task 1):**
   - The simulator script (`backend/scripts/adSimulator.cjs`) must serve dual purposes:
     a. **Standalone CLI Daemon / Script Mode:** Able to be executed independently via `node backend/scripts/adSimulator.cjs` or `npm run simulator` for manual testing, CLI parameter overrides, or background task runners.
     b. **Server-Embedded / Programmable Module Mode:** Able to be imported by `backend/server.cjs` to start/stop the lead generation loop programmatically when the backend HTTP server starts up.
   - Using a CommonJS module structure with exported methods (`startSimulator`, `stopSimulator`, `generateMockLead`, `sendLeadPayload`) and a CLI entry-point guard (`if (require.main === module)`) satisfies both usage patterns without code duplication.

2. **Realistic Mock Payload Generator Design (Task 2):**
   - Ingestion lead criteria directly feed into Milestone 5 qualification rules (`annual_income`, `asset_volume`, `credit_score`).
   - To make simulation realistic for CRM evaluation, each channel (`meta`, `google`, `tv`) should have tailored audience profiles:
     - **Meta Ads (`meta`):** Social media lead forms targeting mid-to-high income individuals (Income: $65,000–$220,000, Assets: $150,000–$1,200,000, Credit: 640–790).
     - **Google Search Ads (`google`):** High-intent wealth searchers (Income: $110,000–$380,000, Assets: $400,000–$3,500,000, Credit: 680–820).
     - **TV Commercials (`tv`):** Broadcast pre-retirees and traditional investors (Income: $85,000–$290,000, Assets: $300,000–$2,800,000, Credit: 660–810).
   - Data generation pools should generate randomized names, emails (`@gmail.com`, `@yahoo.com`, `@outlook.com`, corporate domains), E.164 phone numbers (`+1555XXXXXXX`), and campaign IDs (`cmp_meta_wealth_2026`, `cmp_goog_wealth_mgmt`, `cmp_tv_prime_news`).
   - Overall distribution should yield ~65% qualified candidates and ~35% disqualified candidates to validate down-stream qualification screening in M5.

3. **HTTP Streaming & Resilience (Task 3):**
   - The simulator streams lead payloads by performing periodic HTTP POST requests to `http://localhost:3001/api/webhooks/campaigns` (or configurable target URL via CLI `--target` or `SIMULATOR_TARGET_URL` env variable).
   - Interval timing: Default interval of 8,000 ms (8 seconds), with an optional randomized jitter (±1,500 ms) to emulate organic lead conversion intervals.
   - Rotation strategy: Round-robin rotation across `meta` -> `google` -> `tv` or weighted random selection.
   - Error handling & resilience: If the target server is unreachable (e.g. backend booting up, network error `ECONNREFUSED`), the simulator must catch errors gracefully, output a warning log, and retry on the next interval tick without crashing the process.

4. **Server Lifecycle Integration (Task 4):**
   - In `backend/server.cjs`, inside `server.listen(PORT, ...)`:
     - Check environment variable `ENABLE_AD_SIMULATOR` (defaults to `true` or `enabled` unless explicitly set to `'false'`).
     - Import `startSimulator` from `./scripts/adSimulator.cjs` and pass configuration (`port`, `intervalMs`, `targetUrl`).
     - Attach process shutdown hooks (`SIGINT`, `SIGTERM`) to invoke `stopSimulator()`, ensuring clean cleanup of `setInterval` handles when the server stops.

---

## 3. Caveats

1. **Read-Only Constraint:** This report is strictly an architectural plan. No files in `backend/` were modified during this investigation.
2. **Server Port & Host Resolution:** If `backend/server.cjs` runs on a non-default port (e.g., `PORT=3002`), the simulator must resolve the active server port dynamically when initialized inside `server.cjs`.
3. **M5 Qualification Engine Interaction:** In Milestone 4, `POST /api/webhooks/campaigns` persists the lead and returns status `'received'`. In Milestone 5, the qualification engine triggers upon lead insertion to evaluate financial metrics and broadcast WebSocket updates (`LEAD_QUALIFIED`). The mock payload format strictly matches the interface required by M5.

---

## 4. Conclusion

The ad simulator `backend/scripts/adSimulator.cjs` should be implemented as a robust CommonJS module featuring:
1. **MockPayloadGenerator**: Modular random generator producing valid payloads for Meta, Google, and TV channels with realistic contact & financial profiles.
2. **AdSimulatorClient**: Zero-dependency HTTP POST streamer using native `fetch` with response logging and error catching.
3. **AdSimulatorRunner**: Timer loop (`setInterval`) managing channel rotation, start/stop state, and metrics tracking.
4. **CLI & Module Exports**: Standalone runnable script + exports for `backend/server.cjs` auto-start.

### Concrete Implementation Plan

#### File 1: `backend/scripts/adSimulator.cjs` (New File Creation)

```javascript
/**
 * AUTOMATED AD CAMPAIGN LEAD SIMULATOR (R4.2)
 * Periodically streams simulated lead payloads from Meta, Google, and TV ads
 * to the POST /api/webhooks/campaigns ingestion endpoint.
 */

const http = require('http');

// --- DATA POOLS FOR REALISTIC LEAD GENERATION ---
const FIRST_NAMES = [
  'Alexander', 'Beatrice', 'Charles', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah',
  'Ian', 'Julia', 'Kevin', 'Laura', 'Marcus', 'Nora', 'Oliver', 'Penelope', 'Quentin',
  'Rachel', 'Samuel', 'Theresa', 'Ulysses', 'Victoria', 'William', 'Xena', 'Yusuf', 'Zoe'
];

const LAST_NAMES = [
  'Anderson', 'Brooks', 'Campbell', 'Danforth', 'Evans', 'Fletcher', 'Grayson', 'Hayes',
  'Ingram', 'Jackson', 'Kensington', 'Lancaster', 'Montgomery', 'Nelson', 'Oakley', 'Preston',
  'Quinn', 'Reynolds', 'Sterling', 'Taylor', 'Underwood', 'Vance', 'Waverly', 'York'
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'apexcapital.com', 'vanguardcorp.org'
];

const CHANNEL_CONFIGS = {
  meta: {
    campaigns: ['cmp_meta_wealth_2026', 'cmp_meta_retire_plus', 'cmp_meta_equity_boost'],
    incomeRange: [65000, 220000],
    assetRange: [150000, 1200000],
    creditRange: [640, 790]
  },
  google: {
    campaigns: ['cmp_goog_wealth_mgmt', 'cmp_goog_jumbo_leads', 'cmp_goog_tax_strategy'],
    incomeRange: [110000, 380000],
    assetRange: [400000, 3500000],
    creditRange: [680, 820]
  },
  tv: {
    campaigns: ['cmp_tv_prime_news', 'cmp_tv_retire_safe', 'cmp_tv_legacy_fund'],
    incomeRange: [85000, 290000],
    assetRange: [300000, 2800000],
    creditRange: [660, 810]
  }
};

const CHANNELS = ['meta', 'google', 'tv'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a realistic mock lead payload matching the interface contract
 */
function generateMockLead(channelInput) {
  const channel = channelInput || getRandomElement(CHANNELS);
  const config = CHANNEL_CONFIGS[channel];

  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(10, 99)}@${getRandomElement(EMAIL_DOMAINS)}`;
  const phone = `+1555${getRandomInt(100, 999)}${getRandomInt(1000, 9999)}`;
  const campaignId = getRandomElement(config.campaigns);

  const annualIncome = Math.round(getRandomInt(config.incomeRange[0], config.incomeRange[1]) / 1000) * 1000;
  const assetVolume = Math.round(getRandomInt(config.assetRange[0], config.assetRange[1]) / 5000) * 5000;
  const creditScore = getRandomInt(config.creditRange[0], config.creditRange[1]);

  return {
    channel,
    campaign_id: campaignId,
    lead: {
      full_name: fullName,
      email,
      phone,
      annual_income: annualIncome,
      asset_volume: assetVolume,
      credit_score: creditScore
    }
  };
}

// --- STREAMING CLIENT & TIMER STATE ---
let simulatorIntervalHandle = null;
let currentChannelIndex = 0;
let stats = { totalSent: 0, totalSuccess: 0, totalFailed: 0 };

/**
 * Sends a single lead payload to the webhook target URL using native fetch
 */
async function sendLeadPayload(payload, targetUrl) {
  const url = targetUrl || process.env.SIMULATOR_TARGET_URL || 'http://localhost:3001/api/webhooks/campaigns';
  const timestamp = new Date().toISOString();

  try {
    stats.totalSent++;
    console.log(`[${timestamp}] [AdSimulator] 🚀 Sending ${payload.channel.toUpperCase()} lead payload (${payload.campaign_id}) to ${url}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    stats.totalSuccess++;
    console.log(`[${timestamp}] [AdSimulator] ✅ Webhook accepted! Lead ID: ${data.lead_id} | Status: ${data.status} | Lead: ${payload.lead.full_name} ($${payload.lead.asset_volume.toLocaleString()} assets, $${payload.lead.annual_income.toLocaleString()} inc, ${payload.lead.credit_score} cs)`);
    return { success: true, data };
  } catch (err) {
    stats.totalFailed++;
    console.warn(`[${timestamp}] [AdSimulator] ⚠️ Delivery failed (${err.message}). Server might be restarting. Will retry next cycle.`);
    return { success: false, error: err.message };
  }
}

/**
 * Starts the automated simulator loop
 */
function startSimulator(options = {}) {
  if (simulatorIntervalHandle) {
    console.log('[AdSimulator] Simulator loop is already running.');
    return;
  }

  const port = options.port || process.env.PORT || 3001;
  const targetUrl = options.targetUrl || `http://localhost:${port}/api/webhooks/campaigns`;
  const intervalMs = options.intervalMs || parseInt(process.env.SIMULATOR_INTERVAL_MS || '8000', 10);

  console.log(`[AdSimulator] 🟢 Starting background lead simulator loop (Target: ${targetUrl}, Interval: ${intervalMs}ms)`);

  // Send first payload after brief initial delay (2 seconds) to let server complete boot
  setTimeout(async () => {
    const payload = generateMockLead(CHANNELS[currentChannelIndex]);
    currentChannelIndex = (currentChannelIndex + 1) % CHANNELS.length;
    await sendLeadPayload(payload, targetUrl);
  }, 2000);

  // Set recurring interval
  simulatorIntervalHandle = setInterval(async () => {
    const payload = generateMockLead(CHANNELS[currentChannelIndex]);
    currentChannelIndex = (currentChannelIndex + 1) % CHANNELS.length;
    await sendLeadPayload(payload, targetUrl);
  }, intervalMs);
}

/**
 * Stops the automated simulator loop
 */
function stopSimulator() {
  if (simulatorIntervalHandle) {
    clearInterval(simulatorIntervalHandle);
    simulatorIntervalHandle = null;
    console.log('[AdSimulator] 🔴 Simulator background loop stopped.');
  }
}

function getStats() {
  return { ...stats, isRunning: simulatorIntervalHandle !== null };
}

// --- CLI ENTRY POINT GUARD ---
if (require.main === module) {
  const args = process.argv.slice(2);
  const onceFlag = args.includes('--once');
  const customTarget = args.find(a => a.startsWith('--target='))?.split('=')[1];

  if (onceFlag) {
    console.log('[AdSimulator] Running single simulation test...');
    const payload = generateMockLead();
    sendLeadPayload(payload, customTarget).then(() => process.exit(0));
  } else {
    startSimulator({ targetUrl: customTarget });

    process.on('SIGINT', () => {
      stopSimulator();
      process.exit(0);
    });
  }
}

module.exports = {
  generateMockLead,
  sendLeadPayload,
  startSimulator,
  stopSimulator,
  getStats
};
```

---

#### File 2: Integration Hook in `backend/server.cjs`

In `backend/server.cjs`, add the autostart hook within `server.listen()` (near line 5528):

```javascript
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`NHFG CRM API Server running on port ${PORT}`);

    // Auto-start Ad Lead Simulator unless explicitly disabled
    if (process.env.ENABLE_AD_SIMULATOR !== 'false') {
      try {
        const { startSimulator, stopSimulator } = require('./scripts/adSimulator.cjs');
        startSimulator({
          port: PORT,
          intervalMs: parseInt(process.env.SIMULATOR_INTERVAL_MS || '8000', 10)
        });

        // Graceful shutdown handle
        process.on('SIGINT', () => stopSimulator());
        process.on('SIGTERM', () => stopSimulator());
      } catch (err) {
        console.error('[Server] Failed to initialize Ad Lead Simulator:', err.message);
      }
    }
  });
}
```

---

## 5. Verification Method

To verify the implementation of R4.2 once code modifications are completed:

1. **Standalone CLI Test (Single Ping):**
   ```bash
   node backend/scripts/adSimulator.cjs --once --target=http://localhost:3001/api/webhooks/campaigns
   ```
   *Expected Output:*
   Logs mock payload generation and successful HTTP 200 response with generated `lead_id`.

2. **Standalone Daemon Test (Interval Loop):**
   ```bash
   node backend/scripts/adSimulator.cjs
   ```
   *Expected Output:*
   Logs repeated pings every 8 seconds, cycling between `META`, `GOOGLE`, and `TV` channels.

3. **Server Autostart Integration Test:**
   ```bash
   node backend/server.cjs
   ```
   *Expected Output:*
   - Server boots on port 3001.
   - `[AdSimulator] 🟢 Starting background lead simulator loop` log appears.
   - Periodic lead ingestion logs appear every 8s: `[AdSimulator] ✅ Webhook accepted! Lead ID: ...`.

4. **Database Verification:**
   Inspect PostgreSQL / Supabase `leads` table to confirm mock leads are being created with correct `source` ("Meta Ads", "Google Ads", "TV Ads"), `campaign_id`, and `custom_details` containing `annual_income`, `asset_volume`, and `credit_score`.
