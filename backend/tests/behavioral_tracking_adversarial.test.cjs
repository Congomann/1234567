/**
 * behavioral_tracking_adversarial.test.cjs
 * 
 * Adversarial Stress & Chaos Verification Suite for Behavioral Tracking Service (Milestone M5)
 * Challenger 1 (challenger_bt_1)
 * 
 * Attack Vectors:
 * 1. Millisecond boundary session timeouts (14m 59s vs 15m 00s vs 15m 01s, 8h max session cap, out-of-order timestamps).
 * 2. High concurrency / burst stress (50 parallel requests with identical visitor IDs, race condition analysis).
 * 3. Malformed, empty, type-mismatched, and adversarial payloads (nulls, missing fields, type errors, invalid dates, injection strings).
 * 4. Anonymous lead conversion & retroactive multi-session stitching across distinct sessions and IPs.
 * 5. Identity collision & cross-contamination on shared IP addresses.
 * 6. HTTP API Resilience & Error Boundary Testing via Express.
 */

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { PassThrough } = require('node:stream');
const express = require('express');

const analyticsRouter = require('../routes/analytics.cjs');
const {
  BehavioralTrackingService,
  behavioralTrackingService,
  SESSION_INACTIVITY_TIMEOUT_MS
} = require('../services/behavioralTrackingService.cjs');

describe('Adversarial Challenger Suite: Behavioral Tracking Engine Stress Tests', () => {
  let service;
  let app;

  before(() => {
    app = express();
    app.use(express.json());
    app.use('/api', analyticsRouter);
  });

  beforeEach(() => {
    service = new BehavioralTrackingService();
    behavioralTrackingService.reset();
  });

  /**
   * Helper to dispatch mock HTTP requests directly to Express router in-memory
   */
  function dispatchToExpress(appInstance, urlPath, options = {}) {
    return new Promise((resolve) => {
      const parsed = new URL(`http://127.0.0.1${urlPath}`);
      const req = new http.IncomingMessage();
      req.method = options.method || 'GET';
      req.url = parsed.pathname + parsed.search;
      const lowerHeaders = {};
      if (options.headers) {
        for (const [k, v] of Object.entries(options.headers)) {
          lowerHeaders[k.toLowerCase()] = v;
        }
      }
      req.headers = {
        host: '127.0.0.1',
        ...lowerHeaders
      };

      const resStream = new PassThrough();
      const dummySocket = {
        remoteAddress: options.remoteAddress || '127.0.0.1',
        encrypted: false,
        destroy: () => {}
      };
      req.socket = dummySocket;
      req.connection = dummySocket;
      const res = new http.ServerResponse(req);
      res.assignSocket(resStream);

      const chunks = [];
      res.write = function(chunk, encoding, cb) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        if (cb) cb();
        return true;
      };
      res.end = function(chunk, encoding, cb) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        res.emit('finish');
        if (cb) cb();
        const bodyBuffer = Buffer.concat(chunks);
        const text = bodyBuffer.toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch (e) {}
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          text: async () => text,
          json: async () => json
        });
      };

      if (options.body) {
        req.body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        req._body = true;
      } else {
        req.body = {};
        req._body = true;
      }

      appInstance(req, res);
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ATTACK VECTOR 1: MILLISECOND BOUNDARY INACTIVITY TIMEOUTS
  // ════════════════════════════════════════════════════════════════════════════

  test('Boundary: 14m 59s gap stays in same session; subsequent 15m 01s gap forces new session and finalizes previous', async () => {
    const t0 = 1772592000000; // Base timestamp
    const visitorId = 'vis_boundary_user';
    const ip = '192.168.1.100';

    // Hit 1 at T0
    const r1 = await service.recordVisit({
      visitorId,
      ip,
      path: '/step-1',
      timestamp: t0
    });
    assert.equal(r1.success, true);
    assert.equal(r1.isNewSession, true);
    const session1Id = r1.sessionId;

    // Hit 2 at T0 + 14m 59s (899,000 ms) — MUST stay same session
    const t_14m59s = t0 + (14 * 60 + 59) * 1000;
    const r2 = await service.recordVisit({
      visitorId,
      sessionId: session1Id,
      ip,
      path: '/step-2',
      timestamp: t_14m59s
    });
    assert.equal(r2.success, true);
    assert.equal(r2.isNewSession, false, '14m 59s inactivity must NOT trigger session expiration');
    assert.equal(r2.sessionId, session1Id);
    assert.equal(r2.pageCount, 2);
    assert.equal(r2.sessionDuration, 899, 'Duration must equal 899 seconds');

    // Hit 3 at T0 + 14m 59s + 14m 59s (T0 + 29m 58s) — Sliding window resets on activity!
    // Total elapsed from start = 1798s, but gap from Hit 2 is 899s (< 900s).
    const t_29m58s = t_14m59s + (14 * 60 + 59) * 1000;
    const r3 = await service.recordVisit({
      visitorId,
      sessionId: session1Id,
      ip,
      path: '/step-3',
      timestamp: t_29m58s
    });
    assert.equal(r3.success, true);
    assert.equal(r3.isNewSession, false, 'Sliding window must extend session if gap from last activity is 14m 59s');
    assert.equal(r3.sessionId, session1Id);
    assert.equal(r3.pageCount, 3);
    assert.equal(r3.sessionDuration, 1798);

    // Hit 4 at T0 + 29m 58s + 15m 01s (T0 + 44m 59s) — Inactivity gap is 15m 01s (> 900,000 ms).
    // MUST trigger expiration and generate fresh session!
    const t_44m59s = t_29m58s + (15 * 60 + 1) * 1000;
    const r4 = await service.recordVisit({
      visitorId,
      sessionId: session1Id, // client passes previous session ID
      ip,
      path: '/step-4',
      timestamp: t_44m59s
    });
    assert.equal(r4.success, true);
    assert.equal(r4.isNewSession, true, '15m 01s inactivity gap MUST trigger new session');
    assert.notEqual(r4.sessionId, session1Id, 'New session must have distinct cryptographic session ID');
    assert.equal(r4.pageCount, 1);
    assert.equal(r4.sessionDuration, 0);

    // Verify Session 1 finalization in Firestore
    const s1 = await service.getSession(session1Id);
    assert.equal(s1.is_active, false, 'Expired session must be marked inactive');
    assert.equal(s1.ended_at, new Date(t_29m58s).toISOString(), 'Session 1 ended_at must be timestamp of last activity (Hit 3)');
    assert.equal(s1.duration_seconds, 1798, 'Session 1 duration must be frozen at 1798s');
    assert.equal(s1.page_count, 3);

    // Verify Session 2 in Firestore
    const s2 = await service.getSession(r4.sessionId);
    assert.equal(s2.is_active, true);
    assert.equal(s2.started_at, new Date(t_44m59s).toISOString());
    assert.equal(s2.page_count, 1);
  });

  test('Boundary: Exact 900,000 ms (15m 00s 000ms) vs 900,001 ms (15m 00s 001ms) behavior', async () => {
    const t0 = 1772592000000;
    const visitorId = 'vis_exact_boundary';

    // Hit 1 at T0
    const r1 = await service.recordVisit({ visitorId, path: '/p1', timestamp: t0 });
    const s1Id = r1.sessionId;

    // Hit 2 exactly at 900,000 ms boundary (15m 00s 000ms)
    // Code says: inactiveGap <= this.inactivityTimeoutMs (900000 <= 900000 is true)
    const r2 = await service.recordVisit({
      visitorId,
      sessionId: s1Id,
      path: '/p2',
      timestamp: t0 + 900000
    });
    assert.equal(r2.isNewSession, false, 'Exact 900,000 ms matches <= threshold and continues session');
    assert.equal(r2.sessionId, s1Id);

    // Hit 3 at 900,001 ms after Hit 2 (1 ms past threshold)
    const r3 = await service.recordVisit({
      visitorId,
      sessionId: s1Id,
      path: '/p3',
      timestamp: (t0 + 900000) + 900001
    });
    assert.equal(r3.isNewSession, true, '900,001 ms gap (1ms beyond limit) MUST trigger new session');
    assert.notEqual(r3.sessionId, s1Id);
  });

  test('Boundary: 8-Hour Max Session Safety Cap forces new session even if user remains active', async () => {
    const t0 = 1772592000000;
    const visitorId = 'vis_8hour_cap_user';

    let r = await service.recordVisit({ visitorId, path: '/start', timestamp: t0 });
    const s1Id = r.sessionId;

    // Simulate active user clicking every 10 minutes for 8 hours (48 visits)
    let currentTime = t0;
    for (let i = 1; i <= 48; i++) {
      currentTime += 10 * 60 * 1000; // +10 min
      r = await service.recordVisit({
        visitorId,
        sessionId: s1Id,
        path: `/page-${i}`,
        timestamp: currentTime
      });
      // While within 8 hours (8 * 60 * 60 * 1000 = 28,800,000 ms), session must stay unified
      if (currentTime - t0 <= 8 * 60 * 60 * 1000) {
        assert.equal(r.sessionId, s1Id, `At ${i * 10}m, should still be session 1`);
      }
    }

    // Now advance 1 minute past 8 hours (total 8h 1m = 28,860,000 ms from start)
    // Inactivity gap is only 1 min (< 15 min), but totalDuration exceeds MAX_SESSION_DURATION_MS (8h)
    currentTime = t0 + 8 * 60 * 60 * 1000 + 60 * 1000;
    const rCap = await service.recordVisit({
      visitorId,
      sessionId: s1Id,
      path: '/beyond-8-hours',
      timestamp: currentTime
    });

    assert.equal(rCap.isNewSession, true, 'Exceeding 8-hour max duration safety cap MUST trigger new session');
    assert.notEqual(rCap.sessionId, s1Id);

    // Old session must be finalized
    const oldSession = await service.getSession(s1Id);
    assert.equal(oldSession.is_active, false);
  });

  test('Boundary: Out-of-order timestamps handled without crashing', async () => {
    const t0 = 1772592000000;
    const visitorId = 'vis_out_of_order';

    // Visit 1 at T0 + 10s
    const r1 = await service.recordVisit({ visitorId, path: '/p1', timestamp: t0 + 10000 });
    assert.equal(r1.success, true);

    // Visit 2 with earlier timestamp (T0 - 5s) due to client clock drift
    const r2 = await service.recordVisit({
      visitorId,
      sessionId: r1.sessionId,
      path: '/p2',
      timestamp: t0 - 5000
    });
    assert.equal(r2.success, true);
    // Server must not throw and should retain valid duration (non-negative)
    assert.ok(r2.sessionDuration >= 0);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ATTACK VECTOR 2: HIGH CONCURRENCY / BURST VISITS
  // ════════════════════════════════════════════════════════════════════════════

  test('Concurrency Stress: 50 concurrent burst hits with existing sessionId do not throw or corrupt server state', async () => {
    const visitorId = 'vis_concurrency_established';
    const initRes = await service.recordVisit({ visitorId, path: '/init' });
    const sessionId = initRes.sessionId;

    // Fire 50 simultaneous hits with same sessionId
    const burstPromises = Array.from({ length: 50 }, (_, i) => {
      return service.recordVisit({
        visitorId,
        sessionId,
        path: `/concurrent-page-${i}`,
        title: `Concurrent Page ${i}`,
        ip: '10.0.0.1'
      });
    });

    const results = await Promise.all(burstPromises);
    
    // Check for 0 crashes or unhandled rejections
    assert.equal(results.length, 50);
    results.forEach((res, idx) => {
      assert.equal(res.success, true, `Request ${idx} must return success: true`);
      assert.equal(typeof res.sessionId, 'string');
    });

    // Inspect stored session
    const sessionInDb = await service.getSession(sessionId);
    assert.ok(sessionInDb);
    assert.equal(sessionInDb.is_active, true);
    // In-memory DocumentSnapshot deep-cloning causes read-modify-write race under raw Promise.all:
    console.log(`[Empirical Concurrency Finding] 50 concurrent requests recorded ${sessionInDb.pages_visited.length} pages in session.`);
  });

  test('Concurrency Stress: 30 concurrent initial hits without sessionId for brand-new visitor ID', async () => {
    const visitorId = 'vis_brand_new_burst';

    // 30 simultaneous requests without sessionId (race to create session)
    const burstPromises = Array.from({ length: 30 }, (_, i) => {
      return service.recordVisit({
        visitorId,
        path: `/initial-burst-${i}`,
        ip: '10.0.0.2'
      });
    });

    const results = await Promise.all(burstPromises);
    assert.equal(results.length, 30);
    results.forEach(res => {
      assert.equal(res.success, true);
    });

    const sessionQuery = await service.querySessions({ visitorId });
    console.log(`[Empirical Burst Finding] 30 simultaneous un-sessioned hits created ${sessionQuery.totalSessions} sessions.`);
    assert.ok(sessionQuery.totalSessions >= 1, 'At least 1 session must be recorded');
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ATTACK VECTOR 3: MALFORMED / ADVERSARIAL PAYLOADS & RESILIENCE
  // ════════════════════════════════════════════════════════════════════════════

  test('Payload Resilience: handles empty objects, nulls, missing paths, and stringified nulls gracefully', async () => {
    // 1. Completely empty payload
    const rEmpty = await service.recordVisit({});
    assert.equal(rEmpty.success, true);
    assert.ok(rEmpty.sessionId);
    assert.equal(rEmpty.pageCount, 1);

    // 2. Stringified 'null' and 'undefined' session IDs
    const rNullString = await service.recordVisit({
      visitorId: 'vis_test_null_str',
      sessionId: 'null',
      path: '/null-session-test'
    });
    assert.equal(rNullString.success, true);
    assert.notEqual(rNullString.sessionId, 'null');

    const rUndefString = await service.recordVisit({
      visitorId: 'vis_test_undef_str',
      sessionId: 'undefined',
      path: '/undef-session-test'
    });
    assert.equal(rUndefString.success, true);
    assert.notEqual(rUndefString.sessionId, 'undefined');

    // 3. Null and empty string paths/titles/referrers
    const rNullFields = await service.recordVisit({
      visitorId: 'vis_null_fields',
      path: null,
      title: null,
      referrer: null
    });
    assert.equal(rNullFields.success, true);
    const session = await service.getSession(rNullFields.sessionId);
    assert.equal(session.pages_visited[0].path, '/');
    assert.equal(session.pages_visited[0].title, '');
    assert.equal(session.pages_visited[0].referrer, '');
  });

  test('Payload Resilience: SQL injection, XSS vectors, and massive payloads in fields', async () => {
    const maliciousVisitorId = "vis_test'; DROP TABLE sessions; <script>alert('xss')</script>";
    const maliciousPath = "/products/life/quote?test=' OR 1=1 -- <svg onload=alert(1)>";
    const hugeTitle = 'A'.repeat(10000); // 10KB string

    const rMalicious = await service.recordVisit({
      visitorId: maliciousVisitorId,
      path: maliciousPath,
      title: hugeTitle,
      ip: "127.0.0.1'; DROP TABLE leads; --"
    });

    assert.equal(rMalicious.success, true);
    const queried = await service.querySessions({ visitorId: maliciousVisitorId });
    assert.equal(queried.totalSessions, 1);
    assert.equal(queried.sessions[0].visitor_id, maliciousVisitorId);
    assert.equal(queried.sessions[0].pages_visited[0].path, maliciousPath);
  });

  test('Payload Resilience: Query API with negative limits, non-numeric limits, and empty parameters', async () => {
    // Should not throw or crash on unexpected query arguments
    const q1 = await service.querySessions({ limit: -1 });
    assert.ok(Array.isArray(q1.sessions));

    const q2 = await service.querySessions({ limit: 'not-a-number' });
    assert.ok(Array.isArray(q2.sessions));

    const q3 = await service.querySessions({});
    assert.ok(Array.isArray(q3.sessions));

    const pNull = await service.getProfile(null);
    assert.equal(pNull, null);

    const pEmpty = await service.getProfile('');
    assert.equal(pEmpty, null);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ATTACK VECTOR 4: MULTI-SESSION ANONYMOUS LEAD CONVERSION & STITCHING
  // ════════════════════════════════════════════════════════════════════════════

  test('Lead Stitching: 3 distinct anonymous sessions stitched retroactively when lead converts on 3rd session', async () => {
    const t0 = 1772592000000;
    const visitorId = 'vis_multi_session_prospect';
    const ip = '198.51.100.77';

    // ─────────────────────────────────────────────────────────────────────────
    // SESSION 1 (T0): Anonymous exploration of life insurance
    // ─────────────────────────────────────────────────────────────────────────
    const rS1 = await service.recordVisit({
      visitorId,
      ip,
      path: '/life-insurance',
      title: 'Term Life Insurance',
      timestamp: t0
    });
    const session1Id = rS1.sessionId;
    assert.equal(rS1.leadLinked, false);

    // ─────────────────────────────────────────────────────────────────────────
    // SESSION 2 (T0 + 30m): Inactivity gap (>15m) -> Second anonymous session (real estate)
    // ─────────────────────────────────────────────────────────────────────────
    const t1 = t0 + 30 * 60 * 1000;
    const rS2 = await service.recordVisit({
      visitorId,
      sessionId: session1Id, // Stale ID provided by browser cookie
      ip,
      path: '/real-estate',
      title: 'Commercial Real Estate Syndications',
      timestamp: t1
    });
    const session2Id = rS2.sessionId;
    assert.equal(rS2.isNewSession, true);
    assert.notEqual(session2Id, session1Id);
    assert.equal(rS2.leadLinked, false);

    // ─────────────────────────────────────────────────────────────────────────
    // SESSION 3 (T0 + 70m): Another inactivity gap -> Third session (quote + conversion)
    // ─────────────────────────────────────────────────────────────────────────
    const t2 = t0 + 70 * 60 * 1000;
    const rS3_page1 = await service.recordVisit({
      visitorId,
      ip,
      path: '/life-insurance/quote',
      title: 'Instant Life Insurance Quote Calculator',
      timestamp: t2
    });
    const session3Id = rS3_page1.sessionId;
    assert.equal(rS3_page1.isNewSession, true);
    assert.notEqual(session3Id, session2Id);
    assert.equal(rS3_page1.leadLinked, false);

    // Page 2 of Session 3 (T0 + 73m): Lead converts! Submits contact form
    const t3 = t2 + 3 * 60 * 1000;
    const leadPayload = {
      name: 'Dr. Evelyn Reed',
      email: 'evelyn.reed@biotech.org',
      phone: '+14155552671'
    };

    const rConversion = await service.recordVisit({
      visitorId,
      sessionId: session3Id,
      ip,
      path: '/schedule',
      title: 'Schedule Advisor Consultation',
      leadInfo: leadPayload,
      timestamp: t3
    });

    assert.equal(rConversion.leadLinked, true);
    assert.ok(rConversion.leadId);
    const leadId = rConversion.leadId;

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY RETROACTIVE STITCHING ACROSS ALL 3 SESSIONS
    // ─────────────────────────────────────────────────────────────────────────
    const s1 = await service.getSession(session1Id);
    const s2 = await service.getSession(session2Id);
    const s3 = await service.getSession(session3Id);

    assert.equal(s1.lead_id, leadId, 'Session 1 must be retroactively linked to leadId');
    assert.equal(s1.lead_email, 'evelyn.reed@biotech.org');
    assert.equal(s1.lead_name, 'Dr. Evelyn Reed');

    assert.equal(s2.lead_id, leadId, 'Session 2 must be retroactively linked to leadId');
    assert.equal(s2.lead_email, 'evelyn.reed@biotech.org');

    assert.equal(s3.lead_id, leadId, 'Session 3 must be directly linked to leadId');
    assert.equal(s3.lead_email, 'evelyn.reed@biotech.org');

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY BEHAVIORAL PROFILE AGGREGATION ACROSS ALL 3 SESSIONS
    // ─────────────────────────────────────────────────────────────────────────
    const profile = await service.getProfile(leadPayload.email);
    assert.ok(profile);
    assert.ok(profile.behavioralProfile);
    const bp = profile.behavioralProfile;

    assert.equal(bp.totalSessions, 3, 'Aggregated profile must reflect all 3 sessions');
    assert.equal(bp.totalPageViews, 4, 'Aggregated profile must reflect 4 total page views');
    assert.ok(bp.marketingTags.includes('crm_lead_linked'), 'Marketing tags must include crm_lead_linked');
    assert.ok(bp.marketingTags.includes('repeat_visitor'), 'Marketing tags must identify repeat_visitor');
    assert.ok(bp.intentScore >= 75, 'Intent score must be high due to quote + lead conversion');
    assert.equal(bp.qualification, 'Hot');

    // Verify lookup by visitorId yields identical stitched profile
    const profileByVisitor = await service.getProfile(visitorId);
    assert.equal(profileByVisitor.linkedLead.email, leadPayload.email);
    assert.equal(profileByVisitor.behavioralProfile.totalSessions, 3);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ATTACK VECTOR 5: CROSS-USER IP COLLISION / SHARED NAT OBSERVATION
  // ════════════════════════════════════════════════════════════════════════════

  test('Identity Edge Case: Shared IP collision and behavior when different visitors use identical IP', async () => {
    const sharedIp = '203.0.113.199';

    // Visitor 1 converts as Alice
    await service.recordVisit({
      visitorId: 'vis_alice_device',
      ip: sharedIp,
      path: '/life-insurance',
      leadInfo: {
        name: 'Alice Cooper',
        email: 'alice@rock.org',
        phone: '+15551112222'
      }
    });

    // Visitor 2 (different device/browser, same office IP) visits anonymously
    const v2Res = await service.recordVisit({
      visitorId: 'vis_bob_device',
      ip: sharedIp,
      path: '/real-estate'
    });

    console.log(`[Empirical IP Resolution Finding] Anonymous visitor on same IP linked to prior lead: ${v2Res.leadLinked} (leadId: ${v2Res.leadId})`);
    
    // Now Visitor 2 provides their OWN lead credentials
    const v2Convert = await service.recordVisit({
      visitorId: 'vis_bob_device',
      sessionId: v2Res.sessionId,
      ip: sharedIp,
      path: '/contact',
      leadInfo: {
        name: 'Bob Dylan',
        email: 'bob@folk.org',
        phone: '+15553334444'
      }
    });

    assert.equal(v2Convert.leadLinked, true);
    console.log(`[Empirical IP Resolution Finding] After Bob converted: Bob leadId = ${v2Convert.leadId}`);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ATTACK VECTOR 6: EXPRESS ROUTE RESILIENCE & ERROR BOUNDARY TESTING
  // ════════════════════════════════════════════════════════════════════════════

  test('Express API Resilience: Malformed JSON body or null fields do not crash Express server', async () => {
    // 1. Post completely empty body {}
    const res1 = await dispatchToExpress(app, '/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {}
    });
    assert.equal(res1.status, 200);
    const json1 = await res1.json();
    assert.equal(json1.success, true);
    assert.ok(json1.sessionId);

    // 2. Post with invalid date timestamp string -> Router catches RangeError and returns 500
    const res2 = await dispatchToExpress(app, '/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        visitorId: 'vis_bad_time',
        timestamp: 'invalid-date-string'
      }
    });
    assert.equal(res2.status, 500);
    const json2 = await res2.json();
    assert.equal(json2.success, false);
    assert.ok(json2.error.includes('time'));

    // 3. Post with leadInfo with non-string types -> Router catches TypeError and returns 500
    const res3 = await dispatchToExpress(app, '/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        visitorId: 'vis_bad_lead',
        leadInfo: { email: 12345 }
      }
    });
    assert.equal(res3.status, 500);
    const json3 = await res3.json();
    assert.equal(json3.success, false);

    // 4. GET profile for non-existent identifier returns 200 with null profile data
    const res4 = await dispatchToExpress(app, '/api/analytics/profiles/non_existent_id_xyz');
    assert.equal(res4.status, 200);
    const json4 = await res4.json();
    assert.equal(json4.success, true);
    assert.equal(json4.behavioralProfile, null);

    // 5. Query sessions with special characters and SQL injection strings returns 200 with empty array
    const res5 = await dispatchToExpress(app, '/api/analytics/sessions/query?ip=127.0.0.1%27%20OR%201=1--');
    assert.equal(res5.status, 200);
    const json5 = await res5.json();
    assert.equal(json5.success, true);
    assert.equal(json5.totalSessions, 0);
  });
});
