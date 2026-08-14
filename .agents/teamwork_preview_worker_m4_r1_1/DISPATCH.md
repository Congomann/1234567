## 2026-08-13T18:41:57Z
You are teamwork_preview_worker_m4_r1_1_rep1 (replacement Worker).
Working directory: /Users/newholland/1234567/.agents/teamwork_preview_worker_m4_r1_1
Workspace directory: /Users/newholland/1234567

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context Files to Read First:
1. /Users/newholland/1234567/ORIGINAL_REQUEST.md
2. /Users/newholland/1234567/PROJECT.md
3. /Users/newholland/1234567/.agents/sub_orch_m4/SCOPE.md
4. /Users/newholland/1234567/.agents/teamwork_preview_explorer_m4_r1_1/handoff.md
5. /Users/newholland/1234567/.agents/teamwork_preview_explorer_m4_r1_2/handoff.md
6. /Users/newholland/1234567/.agents/teamwork_preview_explorer_m4_r1_3/handoff.md

Your Assigned File Write Ownership:
- `backend/routes/webhooks.cjs`
- `backend/scripts/adSimulator.cjs`
- `package.json`
- `backend/tests/m4_webhooks_simulator.test.cjs` (or test files)

Tasks:
1. Implement/Refine `POST /api/webhooks/campaigns` in `backend/routes/webhooks.cjs`:
   - Validate payload requirements:
     - `channel`: required string, must be one of `['meta', 'google', 'tv']` (case-insensitive). Return 400 Bad Request if missing/invalid.
     - `campaign_id`: required non-empty string. Return 400 Bad Request if missing.
     - `lead`: required object. Return 400 Bad Request if missing or not an object.
     - `lead.full_name`: required non-empty string (accept `full_name` or `name`). Return 400 Bad Request if missing.
     - `lead.email`: required valid email string (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Return 400 Bad Request if invalid.
     - `lead.phone`: required non-empty string. Return 400 Bad Request if missing.
     - `lead.annual_income`: required non-negative number (`>= 0`). Return 400 Bad Request if negative or non-numeric.
     - `lead.asset_volume`: required non-negative number (`>= 0`). Return 400 Bad Request if negative or non-numeric.
     - `lead.credit_score`: required integer/number between 300 and 850 (FICO range). Return 400 Bad Request if out of range.
   - Format source channel names (`meta` -> `Meta Ads`, `google` -> `Google Ads`, `tv` -> `TV Ads`).
   - Store lead record in PostgreSQL via Supabase `leads` table (`custom_details` storing financial fields `annual_income`, `asset_volume`, `credit_score`, `channel`).
   - Include resilient error fallback: on database error/disconnection, generate fallback UUID `crypto.randomUUID()`, set `status = 'received'`, and maintain standard success response `{ success: true, lead_id: string, status: "received" }` with HTTP 200.
2. Implement/Refine `backend/scripts/adSimulator.cjs`:
   - Automated background simulator loop streaming simulated Meta, Google, and TV ad lead payloads to `http://localhost:3001/api/webhooks/campaigns` (or `SIMULATOR_TARGET_URL`).
   - Configurable interval (`SIMULATOR_INTERVAL_MS`, default 8000ms), round-robin channel iteration, stats tracking.
   - Multi-mode support: standalone CLI (`--once`, `--target=`, `--interval=`), exportable module (`startSimulator`, `stopSimulator`, `generateMockLead`), auto-start in `backend/server.cjs`.
3. Add convenience scripts to `package.json`:
   - `"simulator": "node backend/scripts/adSimulator.cjs"`
   - `"simulator:once": "node backend/scripts/adSimulator.cjs --once"`
4. Write automated unit & integration test suite in `backend/tests/m4_webhooks_simulator.test.cjs`:
   - Test `POST /api/webhooks/campaigns` success responses for Meta, Google, and TV payloads.
   - Test validation errors (HTTP 400) for all invalid/missing fields.
   - Test `adSimulator.cjs` mock lead generation and `--once` execution.
5. Run the test suite using terminal commands and verify everything passes cleanly.

Write your completion handoff report to `/Users/newholland/1234567/.agents/teamwork_preview_worker_m4_r1_1/handoff.md`.
Include in your handoff report:
- Summary of code changes made.
- Build/test execution commands run and full output.
- Verification steps proving R4.1 and R4.2 are fully operational.
When finished, send a message to parent with the file path.
