# Dispatch for Survey Explorer 3 (Carrier Framework & Test Infrastructure)

## Mission
Survey the existing CRM codebase to map testing infrastructure, package scripts, existing carrier models, and integration points for:
1. R2: Modular Carrier API Framework — universal TypeScript interface/adapter, 1-2 mocked example carriers, normalizing client policy data (status, premium, birthday, missed payments, coverage, duration).
2. Testing harnesses and scripts (Vitest, Jest, tsx, node scripts, package.json scripts) for programmatic verification of R1 & R2 acceptance criteria.

## Instructions
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md`.
- Inspect `package.json`, existing scripts, tests, TypeScript configuration, and any existing carrier or policy files.
- Determine the best test runner or script runner to execute the required programmatic tests cleanly and deterministically.
- Outline the universal carrier interface design, mock carrier implementations, and testing strategies.
- Write your comprehensive findings to `/Users/newholland/1234567/.agents/explorer_bt_survey_3/handoff.md`.

## 2026-09-03T09:32:22Z
Received Task:
You are Survey Explorer 3 (Carrier Framework & Testing Infrastructure).
Working directory: /Users/newholland/1234567/.agents/explorer_bt_survey_3
Identity: Explorer surveying Carrier API framework design and testing infrastructure.

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/explorer_bt_survey_3/DISPATCH.md.
2. Inspect existing package.json, TypeScript configurations, test runners (vitest, jest, mocha, tsx, node:test), scripts, and any existing carrier/policy/client types.
3. Analyze how to design R2 Modular Carrier API Framework:
   - Universal TypeScript interface/adapter for carriers (e.g. CarrierAdapter, CarrierPayload, NormalizedPolicyData).
   - Required fields: client policies, missed payments, birthdays, policy status (active/inactive/lapsed), coverage/premium amounts, policy duration.
   - 1-2 mocked example carriers with distinct payload formats (e.g., AcmeMutual, ApexLife).
4. Analyze how to implement the required programmatic tests / scripts:
   - Script 1: Simulating user visiting 3 different pages in a 15-minute window and verifying storage as a unified session in the database.
   - Script 2: Executing mock carrier adapter with dummy payload and verifying correct data normalization (active status, premium, birthday, etc.).
5. Write your comprehensive analysis and architecture recommendations to /Users/newholland/1234567/.agents/explorer_bt_survey_3/handoff.md.
6. When finished, send a completion message back to your parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e) with a summary and the path to your handoff.md.
