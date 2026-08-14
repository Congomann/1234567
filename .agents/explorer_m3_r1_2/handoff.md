# Handoff Report — Explorer 2 (Milestone M3 Frontend Dialer & Call Logging Investigation)

**Agent**: explorer_m3_r1_2  
**Role**: Explorer 2  
**Milestone**: M3 (Connected SignalWire Dialer & Call Logging)  
**Date**: 2026-08-13  
**Report Path**: `/Users/newholland/1234567/.agents/explorer_m3_r1_2/report.md`

---

## 1. Observation

- **File Inspected**: `pages/crm/TelephonyHub.tsx`
  - Softphone call state is currently represented by a single boolean: `const [isCalling, setIsCalling] = useState(false);` (Line 59).
  - In `handleStartCall` (Lines 113-130), `setIsCalling(true)` is set *before* calling `fetch('/api/signalwire/call', ...)`. If the fetch fails, `console.error` logs the error, but `isCalling` remains `true` — freezing the softphone UI in "Call in Progress".
  - In `handleEndCall` (Lines 132-134), `setIsCalling(false)` is set locally. No API call is made to notify the backend or database that the call ended.
  - The UI lacks state renders for `Connecting`, `Ended`, or `Failed`.
  - The keypad lacks a Backspace/Clear button.

- **File Inspected**: `backend/routes/signalwire.cjs`
  - `POST /api/signalwire/call` (Lines 141-182) expects `toNumber` in `req.body`, whereas `PROJECT.md` and `SCOPE.md` contracts specify `to`.
  - `POST /api/signalwire/call` returns `{ success: true, call: newCall }` without top-level `callId` or `sid` expected by the interface contract.
  - `POST /api/signalwire/call` inserts into `telephony_calls` with hardcoded `status: 'completed'` and `duration_seconds: 45` at initiation time.
  - No call termination or state update endpoint (`POST /api/signalwire/call/status`) exists to log actual call end or duration.

---

## 2. Logic Chain

1. The prompt requires evaluating softphone dialer UI elements, call status display (`Connecting`, `In Call`, `Ended`, `Failed`), timer, call logs, and backend API integration.
2. Direct inspection of `TelephonyHub.tsx` showed `isCalling` boolean state. On network or server error, `isCalling` stays `true`, leaving UI frozen.
3. On call hangup, `handleEndCall` only toggles `isCalling` to `false`, leaving database records with hardcoded pre-populated values rather than actual call duration.
4. Interface contract in `PROJECT.md` specifies request field `to` and response fields `callId` and `sid`. `signalwire.cjs` currently uses `toNumber` and returns `{ success: true, call }`.
5. Therefore, Worker implementation must refactor `signalwire.cjs` to support contract fields and add a `/api/signalwire/call/status` endpoint, while refactoring `TelephonyHub.tsx` to implement a explicit call state machine (`idle` | `connecting` | `in-progress` | `ended` | `failed`).

---

## 3. Caveats

- Investigation was strictly read-only. No source files were modified.
- Live WebRTC audio stream capabilities were not tested as softphone uses API endpoint triggers to SignalWire REST/LAML backend rather than browser WebRTC client SDK.

---

## 4. Conclusion

The frontend dialer UI (`TelephonyHub.tsx`) and backend router (`backend/routes/signalwire.cjs`) require specific refactoring to achieve full contract compliance and robust state management:
1. Implement 5-state Call Machine (`idle`, `connecting`, `in-progress`, `ended`, `failed`) in `TelephonyHub.tsx`.
2. Add call termination endpoint `POST /api/signalwire/call/status` in `signalwire.cjs` to log real call duration and state transitions in PostgreSQL.
3. Standardize API request/response keys (`to`/`toNumber`, `callId`, `sid`).
4. Add keypad Backspace/Clear control and error handling UI.

---

## 5. Verification Method

To verify these findings and future Worker implementation:
1. View `pages/crm/TelephonyHub.tsx` lines 59, 113-134, 322-339.
2. View `backend/routes/signalwire.cjs` lines 141-182.
3. Run `node tests/e2e/runner.mjs` to execute E2E test suite.
4. Execute `POST /api/signalwire/call` with payload `{ "to": "+13125550188" }` and verify response structure `{ success: true, callId: ..., sid: ..., status: ... }`.
