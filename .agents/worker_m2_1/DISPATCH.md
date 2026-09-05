# Dispatch for Worker M2: Modular Carrier API Framework & Adapters

## Mission
Implement Requirement R2 core framework:
1. Universal TypeScript definitions in `services/carrier/types.ts`:
   - `NormalizedPolicyStatus` ('active' | 'inactive' | 'lapsed')
   - `PaymentFrequency`
   - `MissedPaymentInfo` (hasMissedPayment, missedCount, totalAmountDue, lastMissedDate, gracePeriodEndsAt)
   - `PolicyDurationInfo` (effectiveDate, expirationDate, termYears, tenureMonths, isRenewable)
   - `NormalizedPolicyData` (carrierId, carrierName, policyNumber, clientName, clientBirthday, clientAge, status, coverageAmount, premiumAmount, duration, missedPayments, productType, syncedAt)
2. Universal `CarrierAdapter<TRawPayload>` interface in `services/carrier/CarrierAdapter.ts`.
3. `AcmeMutualAdapter` in `services/carrier/adapters/AcmeMutualAdapter.ts` (handling legacy nested snake_case, cents conversion, DOB `YYYY/MM/DD`, status `IN_FORCE`/`GRACE_PERIOD`/`LAPSED`).
4. `ApexLifeAdapter` in `services/carrier/adapters/ApexLifeAdapter.ts` (handling modern InsurTech camelCase, decimal floats, ISO timestamps, delinquent payments, status `CURRENT`/`PAYMENT_PENDING`/`TERMINATED`).
5. `CarrierRegistry` in `services/carrier/CarrierRegistry.ts` (registration, adapter lookup, normalized execution, supported carrier listing).
6. Unit test `backend/tests/carrier_framework.test.cjs` validating normalization across both mock carriers, age calculation, missed payment extraction, and boundary handling.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read `/Users/newholland/1234567/.agents/explorer_bt_survey_3/handoff.md` for exact interface signatures, payload examples, and normalization formulas.

## Exclusive Write Ownership
You own:
- `services/carrier/types.ts`
- `services/carrier/CarrierAdapter.ts`
- `services/carrier/adapters/AcmeMutualAdapter.ts`
- `services/carrier/adapters/ApexLifeAdapter.ts`
- `services/carrier/CarrierRegistry.ts`
- `backend/tests/carrier_framework.test.cjs`

DO NOT edit any files in `backend/routes/analytics.cjs` or `backend/services/behavioralTrackingService.cjs` (owned by other workers).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification Requirements
- Execute your unit test: `node --test backend/tests/carrier_framework.test.cjs`.
- Document all test runs and results in your handoff report.
- Deliver your handoff report to `/Users/newholland/1234567/.agents/worker_m2_1/handoff.md`.
- Send a completion message to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T09:38:56Z
You are the Carrier API Framework Worker (worker_m2_1).
Working directory: /Users/newholland/1234567/.agents/worker_m2_1
Role: Implement Modular Carrier API Framework & Adapters (Milestone M2).

