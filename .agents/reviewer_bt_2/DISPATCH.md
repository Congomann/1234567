# Dispatch for Reviewer 2 (Carrier Framework & Client UI)

## Mission
Independently review Requirement R2 implementation:
1. Modular Carrier API Framework (`services/carrier/types.ts`, `services/carrier/CarrierAdapter.ts`, `services/carrier/adapters/AcmeMutualAdapter.ts`, `services/carrier/adapters/ApexLifeAdapter.ts`, `services/carrier/CarrierRegistry.ts`, `services/carrier/index.ts`).
2. Verify universal TypeScript contracts and all required normalized fields: active status, premium amount, birthday, calculated age, coverage amount, missed payments (count, amount due, grace period), and policy duration (effective date, tenure months, expiration).
3. Verify CRM Client UI integration (`pages/crm/Clients.tsx` and `components/crm/NormalizedPolicySection.tsx`) reachable at `/crm/clients`.
4. Run verification tests:
   - `node scripts/verify-carrier-adapter.mjs`
   - `node --test backend/tests/carrier_framework.test.cjs`
   - `npm run build`
5. Issue explicit verdict: APPROVE or REQUEST_CHANGES in your handoff report.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read worker handoffs: `.agents/worker_m2_1/handoff.md` and `.agents/worker_m3_2/handoff.md`.

## Deliverables
- Deliver your review report to `/Users/newholland/1234567/.agents/reviewer_bt_2/handoff.md`.
- Send a completion message with your verdict (APPROVE or REQUEST_CHANGES) to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T12:57:01Z
User Request received:
Role: Reviewer for Requirement R2 (Modular Carrier API Framework & Client UI).
Working directory: /Users/newholland/1234567/.agents/reviewer_bt_2

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/reviewer_bt_2/DISPATCH.md FIRST.
2. Read /Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md.
3. Review services/carrier/types.ts, services/carrier/CarrierAdapter.ts, services/carrier/adapters/AcmeMutualAdapter.ts, services/carrier/adapters/ApexLifeAdapter.ts, services/carrier/CarrierRegistry.ts, pages/crm/Clients.tsx, and components/crm/NormalizedPolicySection.tsx.
4. Verify universal TypeScript contracts, all 6 normalized policy fields (status, premium, birthday/age, coverage, missed payments, duration), and the CRM Client UI Carrier Policy tab.
5. Run verification commands:
   - node scripts/verify-carrier-adapter.mjs
   - node --test backend/tests/carrier_framework.test.cjs
   - npm run build
6. Write your comprehensive review report to /Users/newholland/1234567/.agents/reviewer_bt_2/handoff.md with explicit verdict: APPROVE or REQUEST_CHANGES.
7. Send a completion message to parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e).
