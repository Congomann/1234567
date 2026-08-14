## 2026-08-13T13:06:17Z
You are the Worker for Milestone 4 (Ad Campaign Ingestion & Simulator).
Your working directory is `/Users/newholland/1234567/.agents/worker_m4_1`. Create your directory first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement Milestone 4: Ad Campaign Ingestion & Simulator.
1. R4.1: Expose `POST /api/webhooks/campaigns` in `backend/routes/webhooks.cjs` accepting lead generation payloads for Meta, Google, and TV ads.
2. R4.2: Create background simulator script `backend/scripts/adSimulator.cjs` streaming mock lead payloads from Meta, Google, and TV ads at fixed intervals (8s default) to `POST /api/webhooks/campaigns`.
3. Integrate ad simulator autostart in `backend/server.cjs` under `server.listen()`.

Inputs & References (READ THESE FILES FIRST):
- Original Request: `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md`
- Project Plan: `/Users/newholland/1234567/PROJECT.md`
- Scope: `/Users/newholland/1234567/.agents/sub_orch_m4/SCOPE.md`
- Explorer 1 Report: `/Users/newholland/1234567/.agents/explorer_m4_1/handoff.md`
- Explorer 3 Report: `/Users/newholland/1234567/.agents/explorer_m4_3/handoff.md`

Write Ownership:
You have exclusive write ownership of:
- `backend/routes/webhooks.cjs`
- `backend/scripts/adSimulator.cjs`
- `backend/server.cjs`

Tasks:
1. Edit `backend/routes/webhooks.cjs` to add `POST /campaigns` route handling Meta, Google, and TV ad lead payloads. Ensure payload fields (`channel`, `campaign_id`, `lead` object containing `full_name`, `email`, `phone`, `annual_income`, `asset_volume`, `credit_score`) are parsed and inserted into the `leads` table/in-memory store, returning `{ success: true, lead_id: uuid, status: 'received' }`.
2. Create `backend/scripts/adSimulator.cjs` implementing dual-mode (CLI `--once`, CLI interval daemon, and programmatic module export `startSimulator` / `stopSimulator`). Generate realistic mock lead data for Meta, Google, and TV channels.
3. Integrate `startSimulator` autostart in `backend/server.cjs` inside `server.listen()`, controlled by `process.env.ENABLE_AD_SIMULATOR !== 'false'`, with graceful `SIGINT`/`SIGTERM` shutdown handlers.
4. Execute build & test commands to verify your implementation:
   - Run syntax/lint checks or node dry-run
   - Test single ping via `node backend/scripts/adSimulator.cjs --once`
   - Test server startup and webhook reception
5. Document all execution commands, terminal outputs, build results, and test logs in your handoff report.

Output Requirements:
Write a full handoff report to `/Users/newholland/1234567/.agents/worker_m4_1/handoff.md`.
Update `/Users/newholland/1234567/.agents/worker_m4_1/progress.md` during execution.
When done, notify parent using send_message.

Completion Criteria:
R4.1 and R4.2 implemented, build/test executed, results documented in handoff report. Do NOT skip tests.
