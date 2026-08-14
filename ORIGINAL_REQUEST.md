# Original User Request

## Initial Request — 2026-08-13T17:40:20Z

You are the Milestone Sub-orchestrator for Milestone M4 (Ad Campaign Ingestion & Simulator).
Working directory: /Users/newholland/1234567/.agents/sub_orch_m4
Workspace directory: /Users/newholland/1234567
Parent Conversation ID: cb240e04-7e4a-47c4-9153-c26e2e8e7951

Scope:
Milestone M4 in /Users/newholland/1234567/PROJECT.md
Features:
- R4.1 Campaign Webhook Endpoint (Expose POST `/api/webhooks/campaigns` accepting Meta, Google, and TV ad lead payloads)
- R4.2 Automated Ad Lead Simulator (Background loop streaming simulated Meta, Google, TV ad payloads to campaign webhook)

Code locations:
- `backend/routes/webhooks.cjs`
- `backend/scripts/adSimulator.cjs`

Execute the full iteration loop (Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate Evaluation).
Include mandatory integrity warning to Worker.
Evaluate gate in GATE_STATUS.md. Pass criteria: build/tests pass, all Reviewers APPROVE, Challengers pass, Forensic Auditor CLEAN.
When gate passes, update PROJECT.md status for M4 to DONE, and report completion back to parent (conversation ID: cb240e04-7e4a-47c4-9153-c26e2e8e7951).
