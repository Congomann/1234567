## 2026-08-13T18:42:00Z
<USER_REQUEST>
You are a Test Writer subagent for the E2E Testing Track of the New Holland Financial CRM system upgrade (Replacement for errored subagent).

Working Directory: /Users/newholland/1234567/.agents/e2e_test_writer_infra_2
Workspace Directory: /Users/newholland/1234567

MANDATORY DOCUMENTS TO READ:
- /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md
- /Users/newholland/1234567/PROJECT.md
- /Users/newholland/1234567/TEST_INFRA.md
- /Users/newholland/1234567/.agents/e2e_explorer_1/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

FILE OWNERSHIP (EXCLUSIVE):
- `tests/e2e/helpers/httpHelper.mjs`
- `tests/e2e/helpers/wsHelper.mjs`
- `tests/e2e/helpers/dbHelper.mjs`
- `tests/e2e/helpers/uiHelper.mjs`
- `tests/e2e/runner.mjs`

TASKS:
1. Create helper modules in `tests/e2e/helpers/`:
   - `httpHelper.mjs`: API request helper for `/api/webhooks/campaigns`, `/api/signalwire/*`, `/api/marketing/*`. Supports sending payloads, setting headers, checking HTTP status, parsing JSON responses.
   - `wsHelper.mjs`: WebSocket helper for `/ws`. Supports connecting to `ws://localhost:3001/ws`, subscribing to `LEAD_QUALIFIED` events, collecting received messages, and handling mock fallback socket if offline.
   - `dbHelper.mjs`: Database query helper for checking `leads`, `telephony_calls`, `users` tables or inspecting recorded mock state.
   - `uiHelper.mjs`: UI selector and DOM contract assertion helper for glassmorphic cards, tab switching, recording toggle, and chart containers.
2. Create `tests/e2e/runner.mjs`:
   - ESM test runner executable (`node tests/e2e/runner.mjs`).
   - Statically or dynamically imports the 4 test suite modules:
     - `./tier1_feature_coverage.test.mjs`
     - `./tier2_boundary_corner.test.mjs`
     - `./tier3_cross_feature.test.mjs`
     - `./tier4_real_world.test.mjs`
   - Executes test cases in order, tracks passes/failures, outputs a cleanly formatted console table with per-tier counts, and exits with process exit code 0 if all tests pass.
   - Ensures fallback test execution mode if standalone server is running or offline (mock fallback server/listeners inside helpers so tests can run cleanly in any CI or local environment).

When complete, verify execution of `node tests/e2e/runner.mjs` and write your handoff report to `/Users/newholland/1234567/.agents/e2e_test_writer_infra_2/handoff.md`.
</USER_REQUEST>
