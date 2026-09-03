## 2026-08-15T08:42:08Z

<USER_REQUEST>
You are an Explorer subagent conducting a deep-dive investigation into the CRM's Database Schema, Authentication, Users & Agents Storage, and Leads & Contacts Storage.

Working directory: /Users/newholland/1234567/.agents/explorer_m1_data
Workspace root: /Users/newholland/1234567
Authoritative request: /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md

Policy: STRICT READ-ONLY. DO NOT modify any CRM source files or database schemas.

Your Investigation Scope:
1. Database Schema and Infrastructure:
   - Inspect backend/schema.sql, backend/migrations/, backend/server.cjs, and backend/supabaseClient.cjs.
   - Detail PostgreSQL version, table definitions, foreign keys, indexes, and migrations.
   - Describe how PostgreSQL connection pooling (Supabase pooler / Cloud SQL) is configured.
   - Document all existing database tables, especially users, advisors, advisor_extensions, leads, clients, interactions, telephony_calls, telephony_sms, etc.

2. Authentication Mechanism:
   - Detail how auth is implemented (JWT in backend/server.cjs, login/register/refresh endpoints, token expiry, secret keys, password hashing e.g. bcrypt/crypto, session management).
   - Document how roles (Administrator, Manager, Advisor, Sub-Admin) and permissions are structured and enforced (RBAC).
   - Explain how PostgreSQL RLS (Row Level Security) is handled or session variables are set.

3. Where and How Users and Agents are Stored:
   - Identify exact database tables storing users, advisors, and agents (e.g. `users`, `advisor_extensions`, `advisors`).
   - List all columns, data types, constraints, and relationships.
   - Explain how agents are associated with extensions, phone numbers, and departments.
   - Document frontend types in types.ts (User, Advisor, etc.) and backend representation.

4. Where and How Leads and Contacts are Stored:
   - Identify exact database tables for leads and clients (`leads`, `clients`, `interactions`, `lead_notes`, etc.).
   - List all columns, custom vertical fields (insurance, real estate, mortgage, securities, logistics), lead scoring, statuses, assignment to advisors.
   - Detail how lead matching (by phone number, email, ANI/caller ID) can be performed for inbound and outbound calls.

Output Requirements:
- Write your complete findings to /Users/newholland/1234567/.agents/explorer_m1_data/report.md.
- Ensure all findings cite specific files and line numbers.
- Send a message to the parent when complete.

</USER_REQUEST>
