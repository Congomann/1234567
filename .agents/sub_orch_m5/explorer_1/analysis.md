# Milestone 5 — Task R5.1 Detailed Investigation Report: Lead Qualification Engine & DB Tagging

**Author:** teamwork_preview_explorer_1  
**Date:** 2026-08-13  
**Target Requirement:** R5.1 (Real-Time CRM Lead Qualification Engine & Database Tagging)  
**Working Directory:** `/Users/newholland/1234567/.agents/sub_orch_m5/explorer_1`

---

## 1. Executive Summary

This report presents a thorough investigation of the backend lead qualification screening and database tagging system for New Holland Financial CRM (Requirement R5.1).

### Key Findings
1. **Missing Service File**: `backend/services/qualificationEngine.cjs` does NOT currently exist in the repository. It needs to be implemented to provide standard financial criteria screening logic.
2. **Payload Flow**: Incoming ad payloads via `POST /api/webhooks/campaigns` contain financial parameters (`asset_volume`, `annual_income`, `credit_score`). These metrics must be extracted and stored inside the `custom_details` JSONB column of the `leads` table.
3. **Qualification Thresholds**:
   - **Asset Volume Threshold**: $\ge \$250,000$ (Instant Qualification for Wealth Management/IUL).
   - **Income & Credit Threshold**: Annual Income $\ge \$100,000$ AND Credit Score $\ge 680$.
   - **Outcome**: Status set to `"Qualified"` if criteria met; otherwise `"Disqualified"`.
4. **Database Constraint Gap**:
   - In `backend/schema.sql` and `backend/supabase_schema.sql`, the `leads.qualification` column has a PostgreSQL check constraint: `CHECK (qualification IN ('Hot', 'Warm', 'Cold'))`.
   - Attempting to set `qualification = 'Qualified'` or `'Disqualified'` will trigger a DB constraint error unless a schema migration is executed to expand the allowed check constraint values or update the tagging fields.

---

## 2. Codebase Inventory & Current Implementation Gaps

| File Path | Current Status | Findings / Required Changes |
|-----------|----------------|-----------------------------|
| `backend/services/qualificationEngine.cjs` | **Missing** | Must be created. Will export `evaluateLead(leadPayload)` which accepts financial inputs and returns `{ status, qualification, reason, score, customDetails }`. |
| `backend/routes/webhooks.cjs` | **Exists** | Currently handles legacy webhooks (`/meta`, `/google`, `/tiktok`). Needs `POST /api/webhooks/campaigns` handler to invoke `qualificationEngine.evaluateLead()` and save the result to DB. |
| `backend/schema.sql` & `backend/supabase_schema.sql` | **Exists** | Table `leads` has `qualification VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold'))`. Needs DB migration to allow `'Qualified'` and `'Disqualified'` in `qualification` column. |
| `backend/server.cjs` | **Exists** | Contains `calculateLeadScore(lead)` (legacy 50-100 score calculator) and WebSocket `broadcast(data)` at `/ws`. Needs to integrate `qualificationEngine` and trigger WebSocket broadcast upon lead ingestion/screening. |
| `backend/routes/marketing.cjs` | **Exists** | Handles marketing campaigns and audiences. Can be extended to allow re-screening existing leads or bulk qualification. |

---

## 3. Incoming Lead Payload & Data Flow Architecture

### 3.1 Webhook Payload Format (`POST /api/webhooks/campaigns`)

As defined in the project interface contract (`PROJECT.md`):

```json
{
  "channel": "meta",
  "campaign_id": "camp_meta_q3_001",
  "lead": {
    "full_name": "Alexander Wright",
    "email": "alex.wright@example.com",
    "phone": "+1-555-019-2834",
    "annual_income": 125000,
    "asset_volume": 350000,
    "credit_score": 740
  }
}
```

### 3.2 Lead Payload Extraction & Mapping

When a payload hits `POST /api/webhooks/campaigns`:
1. **Extraction**:
   - `name` $\leftarrow$ `payload.lead.full_name` || `payload.lead.name` || `'Unknown Lead'`
   - `email` $\leftarrow$ `payload.lead.email`
   - `phone` $\leftarrow$ `payload.lead.phone`
   - `annual_income` $\leftarrow$ `Number(payload.lead.annual_income || 0)`
   - `asset_volume` $\leftarrow$ `Number(payload.lead.asset_volume || 0)`
   - `credit_score` $\leftarrow$ `Number(payload.lead.credit_score || 0)`
   - `channel` $\leftarrow$ `payload.channel || 'direct'`
   - `campaign_id` $\leftarrow$ `payload.campaign_id || 'unknown'`
2. **JSONB Bundling**:
   - `custom_details` = `{ asset_volume, annual_income, credit_score, channel, campaign_id, screened_at: new Date().toISOString() }`
3. **Execution**:
   - Pass normalized object to `qualificationEngine.evaluateLead(...)`.

---

## 4. Financial Qualification Thresholds & Screening Rules

### 4.1 Threshold Rules Matrix

| Metric | Minimum Threshold | Rule Priority | Rationale |
|--------|------------------|---------------|-----------|
| **Asset Volume** | $\ge \$250,000$ | Priority 1 (High Net Worth) | Qualifies lead immediately regardless of income/credit score. |
| **Annual Income** | $\ge \$100,000$ | Priority 2 (Income + Credit Combo) | Must be paired with Credit Score $\ge 680$. |
| **Credit Score** | $\ge 680$ | Priority 2 (Income + Credit Combo) | Prime credit threshold required alongside $\$100\text{k}+$ income. |

### 4.2 Decision Logic Algorithm

```javascript
function evaluateLead(leadData) {
  const assetVolume = Number(leadData.asset_volume || leadData.custom_details?.asset_volume || 0);
  const annualIncome = Number(leadData.annual_income || leadData.custom_details?.annual_income || 0);
  const creditScore = Number(leadData.credit_score || leadData.custom_details?.credit_score || 0);

  let isQualified = false;
  let reason = '';
  let score = 50;

  // Rule 1: High Asset Volume
  if (assetVolume >= 250000) {
    isQualified = true;
    reason = `Qualified: Asset volume ($${assetVolume.toLocaleString()}) meets minimum threshold of $250,000.`;
    score = Math.min(100, 85 + Math.floor((assetVolume - 250000) / 50000) * 2);
  } 
  // Rule 2: High Income + Prime Credit Score
  else if (annualIncome >= 100000 && creditScore >= 680) {
    isQualified = true;
    reason = `Qualified: Annual income ($${annualIncome.toLocaleString()}) and credit score (${creditScore}) meet criteria.`;
    score = 80;
  } 
  // Disqualified Cases
  else {
    isQualified = false;
    const failureReasons = [];
    if (assetVolume < 250000) failureReasons.push(`Asset volume ($${assetVolume.toLocaleString()}) < $250,000`);
    if (annualIncome < 100000) failureReasons.push(`Annual income ($${annualIncome.toLocaleString()}) < $100,000`);
    if (creditScore < 680) failureReasons.push(`Credit score (${creditScore}) < 680`);
    
    reason = `Disqualified: ${failureReasons.join('; ')}.`;
    score = 40;
  }

  const status = isQualified ? 'Qualified' : 'Disqualified';
  const qualification = isQualified ? 'Qualified' : 'Disqualified';

  return {
    status,
    qualification,
    score,
    reason,
    customDetails: {
      asset_volume: assetVolume,
      annual_income: annualIncome,
      credit_score: creditScore,
      qualification_status: status,
      qualification_reason: reason,
      screened_at: new Date().toISOString()
    }
  };
}
```

---

## 5. Database Schema Gaps & Tagging Strategy

### 5.1 The Check Constraint Violation Issue

In existing `backend/schema.sql` (Line 46) and `backend/supabase_schema.sql` (Line 66):
```sql
qualification VARCHAR(20) CHECK (qualification IN ('Hot', 'Warm', 'Cold'))
```
If code attempts `UPDATE leads SET qualification = 'Qualified'`, PostgreSQL will return error `23514 (check_violation)`.

### 5.2 Database Migration Script Requirement

A new migration file must be created at `backend/migrations/20260813_lead_qualification_schema.sql`:

```sql
-- Migration: Enable 'Qualified' and 'Disqualified' in leads table qualification column
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_qualification_check;

ALTER TABLE leads ADD CONSTRAINT leads_qualification_check 
  CHECK (qualification IN ('Hot', 'Warm', 'Cold', 'Qualified', 'Disqualified'));
```

### 5.3 Database Persistence Strategy

When persisting the lead screening results to PostgreSQL / Supabase:
- `status`: Updated to `'Qualified'` or `'Disqualified'` (or kept as `'New'` with `qualification = 'Qualified'`). Standardizing both `status = 'Qualified'|'Disqualified'` and `qualification = 'Qualified'|'Disqualified'` ensures complete UI consistency across CRM filters.
- `score`: Set to calculated score ($80-100$ for Qualified, $< 50$ for Disqualified).
- `custom_details`: JSONB updated with `{ asset_volume, annual_income, credit_score, qualification_status, qualification_reason, screened_at }`.

---

## 6. Proposed Implementation & Integration Plan

### 6.1 Create `backend/services/qualificationEngine.cjs`

Create the service module with function `evaluateLeadPayload(leadPayload)` that handles screening and DB updating.

### 6.2 Update `backend/routes/webhooks.cjs`

Implement handler for `POST /api/webhooks/campaigns`:
1. Extract channel & lead payload.
2. Evaluate lead using `qualificationEngine`.
3. Insert lead record into database.
4. Call WebSocket broadcast helper to notify connected agents.
5. Return JSON HTTP 200 response matching Interface Contract:
   `{ "success": true, "lead_id": lead.id, "status": result.status, "qualification": result.qualification, "reason": result.reason }`.

---

## 7. Recommended Verification Method

1. Run Database Migration:
   ```bash
   node backend/scripts/run_migration.cjs backend/migrations/20260813_lead_qualification_schema.sql
   ```
2. Post Qualified Lead to Webhook:
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/campaigns \
     -H "Content-Type: application/json" \
     -d '{
       "channel": "meta",
       "campaign_id": "camp_test_01",
       "lead": {
         "full_name": "Test High Value Lead",
         "email": "qualified@example.com",
         "phone": "555-123-4567",
         "annual_income": 150000,
         "asset_volume": 500000,
         "credit_score": 750
       }
     }'
   ```
   **Expected Response**: `{ "success": true, "status": "Qualified", "qualification": "Qualified", ... }`.
3. Post Disqualified Lead to Webhook:
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/campaigns \
     -H "Content-Type: application/json" \
     -d '{
       "channel": "google",
       "campaign_id": "camp_test_02",
       "lead": {
         "full_name": "Test Low Value Lead",
         "email": "disqualified@example.com",
         "phone": "555-987-6543",
         "annual_income": 45000,
         "asset_volume": 20000,
         "credit_score": 610
       }
     }'
   ```
   **Expected Response**: `{ "success": true, "status": "Disqualified", "qualification": "Disqualified", ... }`.
4. Verify DB Row:
   ```sql
   SELECT id, name, status, qualification, score, custom_details FROM leads WHERE email = 'qualified@example.com';
   ```

---
*Report completed by teamwork_preview_explorer_1.*
