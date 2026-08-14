# Ad Lead Simulator (R4.2) Requirements & Design Analysis Report

## 1. Observation

### Key Codebase & Contract Findings

1. **Simulator Implementation File (`backend/scripts/adSimulator.cjs`)**:
   - Contains 210 lines of CommonJS code structured into data constants, lead generation, HTTP streaming, loop state management, module exports, and CLI entry guard.
   - **Data Generators** (lines 10-47):
     - `FIRST_NAMES`: 35 first names.
     - `LAST_NAMES`: 32 last names.
     - `EMAIL_DOMAINS`: 7 domain names (`gmail.com`, `yahoo.com`, `outlook.com`, `icloud.com`, `apexcapital.com`, `vanguardcorp.org`, `premierwealth.net`).
     - `CHANNEL_CONFIGS` (lines 28-47): Defines realistic financial ranges per channel:
       - `meta`: Campaigns (`cmp_meta_wealth_2026`, `cmp_meta_retire_plus`, `cmp_meta_equity_boost`), Income: $65k-$220k, Assets: $150k-$1.2M, Credit Score: 640-790.
       - `google`: Campaigns (`cmp_goog_wealth_mgmt`, `cmp_goog_jumbo_leads`, `cmp_goog_tax_strategy`), Income: $110k-$380k, Assets: $400k-$3.5M, Credit Score: 680-820.
       - `tv`: Campaigns (`cmp_tv_prime_news`, `cmp_tv_retire_safe`, `cmp_tv_legacy_fund`), Income: $85k-$290k, Assets: $300k-$2.8M, Credit Score: 660-810.
   - **Lead Payload Generation (`generateMockLead`)** (lines 62-91):
     - Formats full name, realistic email (`first.last<2digits>@domain`), phone (`+1555XXXXXXX`), annual income (rounded to nearest $1,000), asset volume (rounded to nearest $5,000), credit score.
     - Matches the exact Webhook Interface Contract (`PROJECT.md` lines 45-49, `SCOPE.md` lines 20-26).
   - **HTTP Delivery (`sendLeadPayload`)** (lines 100-127):
     - Sends `POST` HTTP requests using global Node `fetch` with `Content-Type: application/json`.
     - Target URL defaults to `process.env.SIMULATOR_TARGET_URL` or `http://localhost:3001/api/webhooks/campaigns`.
     - Maintains internal statistics counter (`stats.totalSent`, `stats.totalSuccess`, `stats.totalFailed`).
   - **Loop Control (`startSimulator` / `stopSimulator`)** (lines 132-169):
     - `startSimulator(options)` configures interval (default `8000`ms via `process.env.SIMULATOR_INTERVAL_MS` or `options.intervalMs`).
     - Schedules an initial dispatch after `initialDelayMs` (default 2000ms or 500ms for CLI), followed by recurring dispatches via `setInterval`.
     - Cycles round-robin across `['meta', 'google', 'tv']`.
     - `stopSimulator()` clears the `setInterval` handle and resets internal state.
   - **CLI Guard (`require.main === module`)** (lines 176-201):
     - Parses `--once`, `--target=<url>`, `--interval=<ms>`.
     - Intercepts process termination signals (`SIGINT`, `SIGTERM`) to invoke `stopSimulator()`.

2. **Server Integration (`backend/server.cjs`)**:
   - Lines 5532-5549: Express server auto-starts the simulator on `server.listen` unless `process.env.ENABLE_AD_SIMULATOR === 'false'`.
     ```javascript
     if (process.env.ENABLE_AD_SIMULATOR !== 'false') {
       const { startSimulator, stopSimulator } = require('./scripts/adSimulator.cjs');
       startSimulator({
         port: PORT,
         intervalMs: parseInt(process.env.SIMULATOR_INTERVAL_MS || '8000', 10)
       });
     }
     ```

3. **Package Scripts (`package.json`)**:
   - Current scripts include `dev`, `server:local`, `start:prod`, `build`, `lint`.
   - Dedicated NPM script entries for running `adSimulator.cjs` (e.g., `npm run simulator` and `npm run simulator:once`) are not yet registered in `package.json`.

4. **CLI Command Test Execution**:
   - Command: `node backend/scripts/adSimulator.cjs --once`
   - Result:
     ```
     [AdSimulator] Running single simulation test...
     [2026-08-13T17:50:10.345Z] [AdSimulator] 🚀 Sending TV lead payload (cmp_tv_retire_safe) to http://localhost:3001/api/webhooks/campaigns...
     [2026-08-13T17:50:10.345Z] [AdSimulator] ⚠️ Delivery failed (fetch failed). Server might be starting or busy. Retrying next cycle.
     ```
   - Confirms standalone execution works properly with native Node `fetch`.

---

## 2. Logic Chain

1. **Background Loop Mechanics**:
   - The loop relies on Node.js `setInterval` with a default duration of 8000ms (8 seconds).
   - Using a configurable environment variable `SIMULATOR_INTERVAL_MS` or argument `options.intervalMs` allows test suites to run rapid simulation cycles (e.g. 500ms) or slow cycles (e.g. 30000ms) without changing code.
   - Initial delay scheduling (`setTimeout`) ensures that when started during server launch, the simulator does not attempt HTTP requests before the HTTP server finishes binding to port 3001.
   - Round-robin cycling (`currentChannelIndex = (currentChannelIndex + 1) % CHANNELS.length`) ensures balanced distribution across Meta, Google, and TV ad lead payloads.

2. **Data Generation Strategy & Payload Compliance**:
   - The generator produces realistic wealth management lead profiles. Financial metrics vary by channel to reflect target demographic differences:
     - **Google Ads**: Represents search intent for high-net-worth services (higher asset volume $400k-$3.5M and credit scores 680-820).
     - **TV Ads**: Represents broader retirement & legacy planning demographics (asset volume $300k-$2.8M).
     - **Meta Ads**: Represents social retargeting & growth equity demographics (asset volume $150k-$1.2M).
   - Numerical metrics are standardized (income rounded to nearest $1k, assets rounded to $5k) to avoid artificial floating point noise.
   - Full compliance with the interface contract:
     ```json
     {
       "channel": "meta" | "google" | "tv",
       "campaign_id": "cmp_...",
       "lead": {
         "full_name": "Alexander Anderson",
         "email": "alexander.anderson42@gmail.com",
         "phone": "+15554328901",
         "annual_income": 145000,
         "asset_volume": 650000,
         "credit_score": 745
       }
     }
     ```

3. **Execution Modes & Architectural Flexibility**:
   - **Mode 1: Standalone CLI Runner**: `node backend/scripts/adSimulator.cjs` can run independently as a background daemon process. Flags `--once`, `--target=...`, `--interval=...` provide flexible local debugging.
   - **Mode 2: Exportable Programmatic Module**: Exporting `startSimulator`, `stopSimulator`, `generateMockLead`, `sendLeadPayload`, `getStats` enables unit/integration tests to start and stop the simulator programmatically without spawning subprocesses.
   - **Mode 3: Embedded Express Auto-Runner**: `backend/server.cjs` seamlessly boots the simulator when starting up in development or demo environments, controlled via `ENABLE_AD_SIMULATOR` env var.
   - **Mode 4: NPM Script Convenience**: Adding `"simulator": "node backend/scripts/adSimulator.cjs"` and `"simulator:once": "node backend/scripts/adSimulator.cjs --once"` to `package.json` standardizes command invocation for developers.

---

## 3. Caveats

- **Read-Only Scope**: This analysis does not modify application code. Proposed NPM scripts or minor enhancements are documented for Worker agents.
- **Server Dependency for HTTP Delivery**: Running `adSimulator.cjs` requires an active server listening on `http://localhost:3001` (or specified target URL) to receive `POST /api/webhooks/campaigns`. If the server is offline, the simulator logs a warning (`Delivery failed (fetch failed)`) and continues its cycle gracefully without throwing unhandled exceptions.
- **Node.js Environment Requirement**: Uses global `fetch` which requires Node.js 18+.

---

## 4. Conclusion

### Summary of Architectural Assessment

| Component | Design / Specification | Implementation Details |
|---|---|---|
| **Loop Functionality** | Configurable interval background loop | `setInterval` with configurable interval (`SIMULATOR_INTERVAL_MS`, default 8s), initial startup delay, round-robin channel iteration, stats tracking. |
| **HTTP Transport** | Native Node `fetch` async POST requests | Targets `http://localhost:3001/api/webhooks/campaigns` (configurable via `SIMULATOR_TARGET_URL`), `Content-Type: application/json`. |
| **Data Generation** | Channel-differentiated financial & lead data | Realistic names, emails, phones, and FICO/income/asset distributions for Meta, Google, and TV campaigns conforming to M4 ↔ M5 Webhook Payload Contract. |
| **Execution Modes** | Multi-mode execution architecture | 1. Stand-alone CLI (`--once`, `--target=`, `--interval=`).<br>2. Programmatic module (`startSimulator`, `stopSimulator`).<br>3. Embedded server auto-start (`backend/server.cjs`).<br>4. Recommended NPM package scripts (`npm run simulator`). |

### Recommended NPM Script Addition to `package.json`

```json
"simulator": "node backend/scripts/adSimulator.cjs",
"simulator:once": "node backend/scripts/adSimulator.cjs --once"
```

---

## 5. Verification Method

1. **Inspect Code Files**:
   - `view_file /Users/newholland/1234567/backend/scripts/adSimulator.cjs`
   - `view_file /Users/newholland/1234567/backend/server.cjs` (lines 5530-5550)
2. **Execute Single Test Simulation**:
   ```bash
   node backend/scripts/adSimulator.cjs --once
   ```
3. **Execute Full Flow Verification (Server + Simulator)**:
   - Start backend: `node backend/server.cjs`
   - In secondary terminal run: `node backend/scripts/adSimulator.cjs --once`
   - Confirm output `✅ Webhook accepted! Lead ID: <UUID>`.
4. **Invalidation Conditions**:
   - Change in `POST /api/webhooks/campaigns` endpoint payload contract.
   - Removal of Node 18+ global `fetch` support.
