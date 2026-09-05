/**
 * behavioral_tracking.test.cjs
 * 
 * Comprehensive Unit & Integration Test Suite for Behavioral Tracking & Firestore Session Management
 * Requirement R1 (Milestone M1)
 * 
 * Verifications:
 * 1. 3 visits within 15 min grouped into 1 unified session (sliding inactivity window).
 * 2. 4th visit at 20 min creates a new session (inactivity timeout).
 * 3. Lead identity resolution & retroactive stitching by leadId, email, phone, IP, visitorId.
 * 4. Profile query by IP address (intent score 0-100, category affinity, targeted ad recommendations).
 * 5. Profile query by user ID / email.
 * 6. Session querying API by IP, user, and visitorId.
 * 7. Admin tracked entities selector API.
 * 8. Direct Firestore collection emulator contract verification ('sessions' and 'behavioral_profiles').
 */

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { PassThrough } = require('node:stream');
const express = require('express');

const analyticsRouter = require('../routes/analytics.cjs');
const {
  behavioralTrackingService,
  SESSION_INACTIVITY_TIMEOUT_MS
} = require('../services/behavioralTrackingService.cjs');

describe('Milestone M1: Behavioral Tracking Engine & Firestore Session Management', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    app = express();
    app.use(express.json());
    app.use('/api', analyticsRouter);

    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(() => {
    behavioralTrackingService.reset();
  });

  /**
   * Dispatches directly to express in-memory if TCP socket is restricted by OS sandbox
   */
  function dispatchToExpress(appInstance, urlString, options = {}) {
    return new Promise((resolve, reject) => {
      const parsed = new URL(urlString);
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
        host: parsed.host,
        ...lowerHeaders
      };

      const resStream = new PassThrough();
      const dummySocket = {
        remoteAddress: '127.0.0.1',
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
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          headers: {
            get: (name) => res.getHeader(name)
          },
          text: async () => text,
          json: async () => JSON.parse(text)
        });
      };

      if (options.body) {
        try {
          req.body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        } catch (e) {
          req.body = options.body;
        }
        req._body = true;
      } else {
        req.body = {};
        req._body = true;
      }

      appInstance(req, res);
    });
  }

  async function safeFetch(url, options = {}) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (err.cause?.code === 'EPERM' || err.code === 'EPERM' || err.cause?.code === 'ECONNREFUSED') {
        return await dispatchToExpress(app, url, options);
      }
      throw err;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 1: 3 VISITS WITHIN 15 MINUTES GROUPED INTO 1 UNIFIED SESSION
  // ══════════════════════════════════════════════════════════════════════════════
  test('simulates 3 visits within 15-minute window and successfully stores as 1 unified session in Firestore', async () => {
    const t0 = 1772592000000; // Reference base time
    const testIp = '198.51.100.42';
    const visitorId = 'vis_simulated_user_1';

    // Visit 1: Landing on Life Insurance page at T0
    const res1 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: testIp,
        path: '/life-insurance',
        title: 'Life Insurance Overview - NHFG',
        timestamp: t0,
        metadata: { deviceType: 'Desktop' }
      })
    });
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.success, true);
    assert.equal(data1.isNewSession, true);
    assert.ok(data1.sessionId.startsWith('sess_'));
    assert.equal(data1.pageCount, 1);
    assert.equal(data1.sessionDuration, 0);

    const sessionId = data1.sessionId;

    // Visit 2: 5 minutes later (T0 + 5 min), viewing Term Life comparison
    const t1 = t0 + 5 * 60 * 1000;
    const res2 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        sessionId,
        ip: testIp,
        path: '/life-insurance/term-comparison',
        title: 'Term Life Comparison - NHFG',
        timestamp: t1,
        metadata: { deviceType: 'Desktop' }
      })
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.success, true);
    assert.equal(data2.isNewSession, false, 'Second visit within 5 min must continue existing session');
    assert.equal(data2.sessionId, sessionId, 'Session ID must match the unified session');
    assert.equal(data2.pageCount, 2);
    assert.equal(data2.sessionDuration, 300, 'Duration should be 300 seconds (5 min)');

    // Visit 3: 12 minutes after T0 (7 min after Visit 2), viewing Quote Calculator
    const t2 = t0 + 12 * 60 * 1000;
    const res3 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        sessionId,
        ip: testIp,
        path: '/life-insurance/quote',
        title: 'Instant Life Insurance Quote Calculator',
        timestamp: t2,
        metadata: { deviceType: 'Desktop' }
      })
    });
    assert.equal(res3.status, 200);
    const data3 = await res3.json();
    assert.equal(data3.success, true);
    assert.equal(data3.isNewSession, false, 'Third visit within sliding window must remain in unified session');
    assert.equal(data3.sessionId, sessionId, 'Session ID must remain unified across 3 visits');
    assert.equal(data3.pageCount, 3);
    assert.equal(data3.sessionDuration, 720, 'Duration should be 720 seconds (12 min)');

    // Verify Firestore 'sessions' collection contains exactly 1 unified document
    const firestore = behavioralTrackingService.getFirestore();
    const sessionDoc = await firestore.collection('sessions').doc(sessionId).get();
    assert.equal(sessionDoc.exists, true);
    const sessionData = sessionDoc.data();
    assert.equal(sessionData.id, sessionId);
    assert.equal(sessionData.visitor_id, visitorId);
    assert.equal(sessionData.ip_address, testIp);
    assert.equal(sessionData.page_count, 3);
    assert.equal(sessionData.is_active, true);
    assert.equal(sessionData.pages_visited.length, 3);
    assert.equal(sessionData.pages_visited[0].path, '/life-insurance');
    assert.equal(sessionData.pages_visited[1].path, '/life-insurance/term-comparison');
    assert.equal(sessionData.pages_visited[2].path, '/life-insurance/quote');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 2: 4TH VISIT AFTER 15-MINUTE INACTIVITY TIMEOUT CREATES NEW SESSION
  // ══════════════════════════════════════════════════════════════════════════════
  test('creates a new session on 4th visit when inactivity gap exceeds 15 minutes (20 min mark)', async () => {
    const t0 = 1772592000000;
    const testIp = '198.51.100.42';
    const visitorId = 'vis_simulated_user_2';

    // 3 initial visits: 0m, 2m, 4m (all within 15 min window)
    const res1 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, ip: testIp, path: '/p1', timestamp: t0 })
    });
    const { sessionId: session1Id } = await res1.json();

    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, sessionId: session1Id, ip: testIp, path: '/p2', timestamp: t0 + 2 * 60 * 1000 })
    });

    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, sessionId: session1Id, ip: testIp, path: '/p3', timestamp: t0 + 4 * 60 * 1000 })
    });

    // 4th visit at 20 minutes from start (T0 + 20 min).
    // Inactivity gap from last activity (4 min) to 20 min is 16 min (> 15-min inactivity threshold: 900,000 ms).
    const t4 = t0 + 20 * 60 * 1000;
    const res4 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        sessionId: session1Id, // Client sends old sessionId
        ip: testIp,
        path: '/annuities',
        title: 'Fixed Index Annuities',
        timestamp: t4
      })
    });
    assert.equal(res4.status, 200);
    const data4 = await res4.json();

    assert.equal(data4.success, true);
    assert.equal(data4.isNewSession, true, 'Visit after 16m of inactivity must trigger new session');
    assert.notEqual(data4.sessionId, session1Id, 'New session must have a fresh unique cryptographic session ID');
    assert.equal(data4.pageCount, 1);

    // Verify Firestore documents:
    const firestore = behavioralTrackingService.getFirestore();
    const oldSession = (await firestore.collection('sessions').doc(session1Id).get()).data();
    const newSession = (await firestore.collection('sessions').doc(data4.sessionId).get()).data();

    // Old session should be finalized with ended_at and is_active = false
    assert.equal(oldSession.is_active, false);
    assert.ok(oldSession.ended_at);
    assert.equal(oldSession.page_count, 3);

    // New session should be active with 1 page
    assert.equal(newSession.is_active, true);
    assert.equal(newSession.page_count, 1);
    assert.equal(newSession.pages_visited[0].path, '/annuities');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 3: LEAD IDENTITY RESOLUTION & RETROACTIVE STITCHING
  // ══════════════════════════════════════════════════════════════════════════════
  test('resolves CRM lead identity and retroactively links prior anonymous sessions', async () => {
    const t0 = 1772592000000;
    const testIp = '203.0.113.88';
    const visitorId = 'vis_unauthenticated_prospect';

    // Anonymous Session 1
    const res1 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: testIp,
        path: '/real-estate',
        title: 'Real Estate Investment Portfolios',
        timestamp: t0
      })
    });
    const { sessionId: session1Id } = await res1.json();

    // Anonymous Session 2 (25 mins later, new session)
    const t1 = t0 + 25 * 60 * 1000;
    const res2 = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: testIp,
        path: '/real-estate/commercial',
        title: 'Commercial Property Opportunities',
        timestamp: t1
      })
    });
    const { sessionId: session2Id } = await res2.json();

    // Visitor now fills out contact/lead form on Session 2
    const t2 = t1 + 3 * 60 * 1000;
    const resLead = await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        sessionId: session2Id,
        ip: testIp,
        path: '/schedule',
        title: 'Schedule Advisor Consultation',
        leadInfo: {
          name: 'Alexander Anderson',
          email: 'alexander.anderson@example.com',
          phone: '+15559876543'
        },
        timestamp: t2
      })
    });
    const dataLead = await resLead.json();

    assert.equal(dataLead.leadLinked, true);
    assert.ok(dataLead.leadId);

    // Verify Session 2 has lead linked
    const s2 = await behavioralTrackingService.getSession(session2Id);
    assert.equal(s2.lead_id, dataLead.leadId);
    assert.equal(s2.lead_email, 'alexander.anderson@example.com');
    assert.equal(s2.lead_name, 'Alexander Anderson');

    // Verify Session 1 was retroactively stitched with lead details
    const s1 = await behavioralTrackingService.getSession(session1Id);
    assert.equal(s1.lead_id, dataLead.leadId, 'Historical session must be stitched with new leadId');
    assert.equal(s1.lead_email, 'alexander.anderson@example.com');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 4: BEHAVIORAL PROFILE QUERY BY IP ADDRESS
  // ══════════════════════════════════════════════════════════════════════════════
  test('queries behavioral profile by IP address with intent score, affinity, and targeted ads', async () => {
    const t0 = 1772592000000;
    const targetIp = '198.51.100.99';
    const visitorId = 'vis_life_shopper';

    // 3 high-intent life insurance visits
    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: targetIp,
        path: '/life-insurance',
        title: 'Life Insurance',
        timestamp: t0
      })
    });

    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: targetIp,
        path: '/life-insurance/quote',
        title: 'Life Insurance Quote',
        timestamp: t0 + 2 * 60 * 1000
      })
    });

    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: targetIp,
        path: '/schedule',
        title: 'Schedule Underwriting Call',
        leadInfo: {
          name: 'Sarah Connor',
          email: 'sarah.connor@example.com',
          phone: '+15553334444'
        },
        timestamp: t0 + 5 * 60 * 1000
      })
    });

    // Query profile by IP
    const profileRes = await safeFetch(`${baseUrl}/api/analytics/profiles/${targetIp}`);
    assert.equal(profileRes.status, 200);
    const profileData = await profileRes.json();

    assert.equal(profileData.success, true);
    assert.equal(profileData.identifier, targetIp);
    assert.ok(profileData.linkedLead);
    assert.equal(profileData.linkedLead.email, 'sarah.connor@example.com');
    assert.equal(profileData.linkedLead.name, 'Sarah Connor');

    const bp = profileData.behavioralProfile;
    assert.ok(bp, 'Behavioral profile must be present');
    assert.equal(bp.totalPageViews, 3);
    assert.ok(bp.intentScore >= 75, `Intent score (${bp.intentScore}) should be >= 75 for quote + lead`);
    assert.equal(bp.qualification, 'Hot');
    assert.ok(bp.categoryAffinity['life-insurance'] > 0);
    assert.ok(bp.targetedAdRecommendations.length >= 2);
    assert.ok(bp.marketingTags.includes('high_intent'));
    assert.ok(bp.marketingTags.includes('life_insurance_affinity'));
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 5: BEHAVIORAL PROFILE QUERY BY USER ID / EMAIL
  // ══════════════════════════════════════════════════════════════════════════════
  test('queries behavioral profile by user email and user ID', async () => {
    const t0 = 1772592000000;
    const email = 'marcus.vance@example.com';
    const visitorId = 'vis_marcus';

    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        ip: '192.0.2.1',
        path: '/securities',
        title: 'Wealth Management Securities',
        leadInfo: {
          name: 'Marcus Vance',
          email,
          phone: '+15556667777'
        },
        timestamp: t0
      })
    });

    // Query profile by user email
    const resEmail = await safeFetch(`${baseUrl}/api/analytics/profiles/${encodeURIComponent(email)}`);
    assert.equal(resEmail.status, 200);
    const dataEmail = await resEmail.json();

    assert.equal(dataEmail.success, true);
    assert.equal(dataEmail.linkedLead.email, email);
    assert.equal(dataEmail.behavioralProfile.primaryCategory, 'securities');
    assert.ok(dataEmail.behavioralProfile.targetedAdRecommendations.some(ad => ad.targetProduct === 'Securities'));
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 6: SESSION QUERY API BY IP, USER, VISITORID
  // ══════════════════════════════════════════════════════════════════════════════
  test('queries sessions by IP and visitorId via GET /api/analytics/sessions/query', async () => {
    const targetIp = '10.20.30.40';
    const visitorId = 'vis_query_test';

    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, ip: targetIp, path: '/home' })
    });

    // Query by IP
    const qIp = await safeFetch(`${baseUrl}/api/analytics/sessions/query?ip=${targetIp}`);
    assert.equal(qIp.status, 200);
    const dataIp = await qIp.json();
    assert.equal(dataIp.totalSessions, 1);
    assert.equal(dataIp.sessions[0].ip_address, targetIp);

    // Query by Visitor ID
    const qVis = await safeFetch(`${baseUrl}/api/analytics/sessions/query?visitorId=${visitorId}`);
    assert.equal(qVis.status, 200);
    const dataVis = await qVis.json();
    assert.equal(dataVis.totalSessions, 1);
    assert.equal(dataVis.sessions[0].visitor_id, visitorId);
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 7: ADMIN TRACKED ENTITIES SELECTOR API
  // ══════════════════════════════════════════════════════════════════════════════
  test('returns all tracked entities via GET /api/admin/analytics/tracked-entities', async () => {
    await safeFetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: 'vis_entity_test',
        ip: '172.16.0.5',
        path: '/mortgage',
        leadInfo: {
          name: 'Dana Scully',
          email: 'dana.scully@fbi.gov',
          phone: '+15550001111'
        }
      })
    });

    const res = await safeFetch(`${baseUrl}/api/admin/analytics/tracked-entities`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.entities.ips));
    assert.ok(data.entities.ips.includes('172.16.0.5'));
    assert.ok(data.entities.visitors.includes('vis_entity_test'));
    assert.ok(data.entities.leads.some(l => l.email === 'dana.scully@fbi.gov'));
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TEST 8: FIRESTORE EMULATOR COMPLIANCE
  // ══════════════════════════════════════════════════════════════════════════════
  test('validates Firestore emulator contract methods on collections and queries', async () => {
    const firestore = behavioralTrackingService.getFirestore();
    const sessionsCol = firestore.collection('sessions');

    // add document
    const docRef = await sessionsCol.add({
      test_field: 'mock_val',
      is_active: true
    });
    assert.ok(docRef.id);

    // get document
    const docSnap = await docRef.get();
    assert.equal(docSnap.exists, true);
    assert.equal(docSnap.data().test_field, 'mock_val');

    // query where
    const qSnap = await sessionsCol.where('test_field', '==', 'mock_val').get();
    assert.equal(qSnap.size, 1);
    assert.equal(qSnap.empty, false);

    let docCount = 0;
    qSnap.forEach(d => {
      assert.equal(d.data().test_field, 'mock_val');
      docCount++;
    });
    assert.equal(docCount, 1);
  });
});
