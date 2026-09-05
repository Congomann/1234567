# BRIEFING — 2026-09-03T09:36:30Z

## Mission
Survey Carrier API framework design (R2) and testing infrastructure (R1/R2 verification scripts) for the CRM.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: /Users/newholland/1234567/.agents/explorer_bt_survey_3
- Original parent: e302f713-1175-43e6-af73-3e1b67df679e
- Milestone: M0 Survey & Architecture Discovery

## 🔒 Key Constraints
- Read-only investigation — do NOT implement CRM source code
- Write only to /Users/newholland/1234567/.agents/explorer_bt_survey_3
- Produce 5-component handoff.md

## Current Parent
- Conversation ID: e302f713-1175-43e6-af73-3e1b67df679e
- Updated: 2026-09-03T09:36:30Z

## Investigation State
- **Explored paths**:
  - `package.json`, `tsconfig.json`, `vite.config.ts`
  - `TEST_INFRA.md`, `tests/e2e/runner.mjs`, `tests/e2e/helpers/httpHelper.mjs`, `backend/tests/m4_webhooks_simulator.test.cjs`
  - `types.ts`, `services/analyticsService.ts`, `backend/schema.sql`, `backend/server.cjs`
  - `pages/crm/Clients.tsx`, `pages/admin/CarrierAssignment.tsx`, `context/DataContext.tsx`
- **Key findings**:
  - Node environment is v24.14.0, which supports native `node:test`, `node:assert/strict`, and `--experimental-strip-types`.
  - No Jest/Vitest/tsx dependencies installed. Existing test scripts rely on `node --test` or custom ESM runners (`node tests/e2e/runner.mjs`).
  - Network sockets hit `connect EPERM` in sandbox without BypassSandbox; test scripts and harnesses should have self-contained in-memory execution paths.
  - Existing `Carrier` type is only `{ name: string, category: string }`. A full `CarrierAdapter` interface, `NormalizedPolicyData`, and `CarrierRegistry` must be built for R2.
  - Two distinct mock carriers designed: `AcmeMutual` (legacy nested snake_case format) and `ApexLife` (modern REST ISO camelCase format).
  - Script 1 and Script 2 designs specified with deterministic verification protocols.
- **Unexplored areas**: Downstream implementation of actual UI components and backend route endpoints.

## Key Decisions Made
- Recommend using native Node.js v24 (`node:test` + standalone ESM runner scripts) to avoid adding heavy unneeded test dependencies.
- Formulate universal carrier adapter types with strict required fields: status ('active'|'inactive'|'lapsed'), premium, birthday, missed payments, coverage, duration.
- Design Script 1 with sliding 15-minute window timestamp assertions (T0, T0+5m, T0+12m unified; T0+30m new session).
- Design Script 2 with comprehensive normalization matrix across AcmeMutual and ApexLife payloads.

## Artifact Index
- DISPATCH.md — Task instructions and dispatches
- BRIEFING.md — Situational awareness and state
- progress.md — Liveness heartbeat
- handoff.md — Comprehensive 5-component report and architecture blueprint
