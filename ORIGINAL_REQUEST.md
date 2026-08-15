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

## Follow-up — 2026-08-15T05:02:29Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: A small focused team (best for a single self-contained fix)

Fix the video upload issue to allow video files (including video/mp4) up to 120MB, and resolve the performance delay in displaying the calendar and team chat.

Working directory: /Users/newholland/1234567
Integrity mode: demo

This is a single self-contained fix; keep it small and focused.

## Requirements

### R1. Fix Video Upload Mime Type and Size Limit
The system must allow uploading video files, specifically fixing the "Upload failed: mime type video/mp4 is not supported" error, and permit file sizes up to 120 MB.

### R2. Fix Calendar and Team Chat Delay
Identify and fix the issue causing delays in displaying the calendar and team chat.

## Acceptance Criteria

### Verify Video Upload Fix
- [ ] A programmatic test or script confirms that a `video/mp4` file up to 120 MB can be successfully uploaded without mime type or size restriction errors.

### Verify Performance Fix
- [ ] A programmatic test or script measures the fetch time for the calendar and team chat before and after the fix, demonstrating a noticeable reduction in delay.
</USER_REQUEST>
