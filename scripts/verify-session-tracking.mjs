/**
 * scripts/verify-session-tracking.mjs
 * 
 * Programmatic Verification Script for Behavioral Tracking & 15-Minute Sessionization (Milestone M4)
 * 
 * Requirements:
 * 1. Simulates a user visiting 3 different pages within a 15-minute window (T0, T0+4m, T0+11m).
 * 2. Verifies that these 3 visits are successfully grouped and stored as a single unified session in Firestore.
 * 3. Verifies session fields:
 *    - Unified sessionId
 *    - pageCount = 3
 *    - duration = 11 minutes (660 seconds)
 *    - start time matches Visit 1
 *    - end time matches Visit 3
 * 4. Includes boundary check: 4th visit at T0+28m (>15 min gap) correctly closes the first session
 *    and creates a distinct second session.
 * 5. Exits with code 0 on pass, non-zero (1) on failure.
 */

import assert from 'node:assert/strict';
import behavioralPkg from '../backend/services/behavioralTrackingService.cjs';

const { BehavioralTrackingService, SESSION_INACTIVITY_TIMEOUT_MS } = behavioralPkg;

// Console colors for clean test reporting
const ANSI = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function logHeader(title) {
  console.log(`\n${ANSI.cyan}${ANSI.bold}================================================================================${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}  ${title}${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}================================================================================${ANSI.reset}\n`);
}

function logStep(stepNum, description) {
  console.log(`${ANSI.yellow}${ANSI.bold}[Step ${stepNum}]${ANSI.reset} ${description}`);
}

function logPass(checkName, details = '') {
  console.log(`  ${ANSI.green}✔ PASS:${ANSI.reset} ${checkName} ${details ? `${ANSI.dim}(${details})${ANSI.reset}` : ''}`);
}

function logFail(checkName, error) {
  console.error(`  ${ANSI.red}✖ FAIL:${ANSI.reset} ${checkName}`);
  console.error(`    ${ANSI.red}${error.message || error}${ANSI.reset}`);
}

async function runSessionTrackingVerification() {
  logHeader('VERIFY SESSION TRACKING & 15-MINUTE SLIDING WINDOW (R1 / M4)');

  const startTime = Date.now();
  let totalAssertions = 0;

  function countAssert(fn, description, details = '') {
    try {
      fn();
      totalAssertions++;
      logPass(description, details);
    } catch (err) {
      logFail(description, err);
      throw err;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // SETUP: Service Initialization & Time Anchors
    // -------------------------------------------------------------------------
    logStep(1, 'Initializing BehavioralTrackingService and Simulated Time Anchors');

    const trackingService = new BehavioralTrackingService();
    const firestore = trackingService.getFirestore();

    const t0 = new Date('2026-09-03T10:00:00.000Z');
    const t1 = new Date(t0.getTime() + 4 * 60 * 1000);  // T0 + 4 min  (10:04:00Z)
    const t2 = new Date(t0.getTime() + 11 * 60 * 1000); // T0 + 11 min (10:11:00Z)
    const t3 = new Date(t0.getTime() + 28 * 60 * 1000); // T0 + 28 min (10:28:00Z) -> gap of 17 min (> 15 min timeout)

    const simulatedVisitorId = `vis_sim_test_${Date.now()}`;
    const simulatedIp = '198.51.100.42';

    console.log(`  • Simulated Visitor ID : ${ANSI.bold}${simulatedVisitorId}${ANSI.reset}`);
    console.log(`  • Simulated Client IP  : ${ANSI.bold}${simulatedIp}${ANSI.reset}`);
    console.log(`  • T0 (Visit 1 Time)    : ${t0.toISOString()}`);
    console.log(`  • T1 (Visit 2 Time)    : ${t1.toISOString()} (+4m)`);
    console.log(`  • T2 (Visit 3 Time)    : ${t2.toISOString()} (+11m)`);
    console.log(`  • T3 (Visit 4 Time)    : ${t3.toISOString()} (+28m, +17m gap > 15m window)\n`);

    // -------------------------------------------------------------------------
    // VISIT 1: Landing Page Visit at T0
    // -------------------------------------------------------------------------
    logStep(2, 'Simulating Visit 1: Landing on /insurance/life at T0 (10:00:00Z)');

    const visit1 = await trackingService.recordVisit({
      visitorId: simulatedVisitorId,
      ip: simulatedIp,
      path: '/insurance/life',
      url: 'https://newholland.crm/insurance/life',
      title: 'Term Life Insurance Overview & Rates',
      referrer: 'https://google.com/search?q=term+life+insurance',
      metadata: { deviceType: 'Desktop', userAgent: 'Mozilla/5.0 Chrome/128.0' },
      timestamp: t0
    });

    countAssert(() => {
      assert.equal(visit1.success, true);
      assert.equal(visit1.isNewSession, true);
      assert.ok(typeof visit1.sessionId === 'string' && visit1.sessionId.startsWith('sess_'));
      assert.equal(visit1.pageCount, 1);
      assert.equal(visit1.sessionDuration, 0);
    }, 'Visit 1 creates fresh session', `Session ID: ${visit1.sessionId}`);

    const unifiedSessionId = visit1.sessionId;

    // -------------------------------------------------------------------------
    // VISIT 2: Calculator Page Visit at T0 + 4 min
    // -------------------------------------------------------------------------
    logStep(3, 'Simulating Visit 2: Visiting /insurance/life/calculator at T0 + 4m (10:04:00Z)');

    const visit2 = await trackingService.recordVisit({
      visitorId: simulatedVisitorId,
      sessionId: unifiedSessionId,
      ip: simulatedIp,
      path: '/insurance/life/calculator',
      url: 'https://newholland.crm/insurance/life/calculator',
      title: 'Instant Life Insurance Premium Calculator',
      referrer: 'https://newholland.crm/insurance/life',
      timestamp: t1
    });

    countAssert(() => {
      assert.equal(visit2.success, true);
      assert.equal(visit2.isNewSession, false);
      assert.equal(visit2.sessionId, unifiedSessionId);
      assert.equal(visit2.pageCount, 2);
      assert.equal(visit2.sessionDuration, 240); // 4 minutes = 240s
    }, 'Visit 2 groups into existing unified session', `duration = ${visit2.sessionDuration}s, pageCount = 2`);

    // -------------------------------------------------------------------------
    // VISIT 3: Application Page Visit at T0 + 11 min
    // -------------------------------------------------------------------------
    logStep(4, 'Simulating Visit 3: Visiting /insurance/life/apply at T0 + 11m (10:11:00Z)');

    const visit3 = await trackingService.recordVisit({
      visitorId: simulatedVisitorId,
      sessionId: unifiedSessionId,
      ip: simulatedIp,
      path: '/insurance/life/apply',
      url: 'https://newholland.crm/insurance/life/apply',
      title: 'Apply for Life Insurance Policy Online',
      referrer: 'https://newholland.crm/insurance/life/calculator',
      timestamp: t2
    });

    countAssert(() => {
      assert.equal(visit3.success, true);
      assert.equal(visit3.isNewSession, false);
      assert.equal(visit3.sessionId, unifiedSessionId);
      assert.equal(visit3.pageCount, 3);
      assert.equal(visit3.sessionDuration, 660); // 11 minutes = 660s
    }, 'Visit 3 groups into same unified session', `duration = ${visit3.sessionDuration}s (11m), pageCount = 3`);

    // -------------------------------------------------------------------------
    // VERIFY DATABASE STORE: Single Unified Session in Firestore
    // -------------------------------------------------------------------------
    logStep(5, 'Querying Database (Firestore): Verifying Unified Session Record');

    const sessionDocSnap = await firestore.collection('sessions').doc(unifiedSessionId).get();
    
    countAssert(() => {
      assert.equal(sessionDocSnap.exists, true);
    }, 'Firestore session document exists in "sessions" collection');

    const storedSession = sessionDocSnap.data();

    countAssert(() => {
      assert.equal(storedSession.id, unifiedSessionId);
    }, 'Stored session ID matches unified sessionId', storedSession.id);

    countAssert(() => {
      assert.equal(storedSession.visitor_id, simulatedVisitorId);
      assert.equal(storedSession.ip_address, simulatedIp);
    }, 'Visitor ID and IP address correctly preserved in session document');

    countAssert(() => {
      assert.equal(storedSession.page_count, 3);
      assert.equal(storedSession.pages_visited.length, 3);
    }, 'Session contains exactly 3 page visits in history');

    countAssert(() => {
      assert.equal(storedSession.duration_seconds, 660);
    }, 'Session duration exactly equals 11 minutes (660 seconds)');

    countAssert(() => {
      assert.equal(storedSession.started_at, t0.toISOString());
    }, 'Session start time matches Visit 1 time', storedSession.started_at);

    countAssert(() => {
      assert.equal(storedSession.last_activity_at, t2.toISOString());
    }, 'Session end/last_activity time matches Visit 3 time', storedSession.last_activity_at);

    countAssert(() => {
      assert.equal(storedSession.pages_visited[0].path, '/insurance/life');
      assert.equal(storedSession.pages_visited[0].viewed_at, t0.toISOString());
      assert.equal(storedSession.pages_visited[1].path, '/insurance/life/calculator');
      assert.equal(storedSession.pages_visited[1].viewed_at, t1.toISOString());
      assert.equal(storedSession.pages_visited[2].path, '/insurance/life/apply');
      assert.equal(storedSession.pages_visited[2].viewed_at, t2.toISOString());
    }, 'Sequential page visit paths and timestamps strictly preserved');

    // Verify exactly 1 session exists in database for this visitor
    const visitorSessionsSnapshot = await firestore.collection('sessions')
      .where('visitor_id', '==', simulatedVisitorId)
      .get();

    countAssert(() => {
      assert.equal(visitorSessionsSnapshot.size, 1);
    }, 'Database query confirms exactly 1 unified session stored for visitor');

    // -------------------------------------------------------------------------
    // BOUNDARY CHECK: Visit 4 at T0 + 28 min (17 min gap > 15-minute window)
    // -------------------------------------------------------------------------
    logStep(6, 'Simulating Visit 4: Visiting /contact-advisor at T0 + 28m (17m gap > 15m timeout)');

    const visit4 = await trackingService.recordVisit({
      visitorId: simulatedVisitorId,
      sessionId: unifiedSessionId, // Client holds stale sessionId
      ip: simulatedIp,
      path: '/contact-advisor',
      url: 'https://newholland.crm/contact-advisor',
      title: 'Schedule a Consultation with a Wealth Advisor',
      timestamp: t3
    });

    countAssert(() => {
      assert.equal(visit4.success, true);
      assert.equal(visit4.isNewSession, true);
      assert.notEqual(visit4.sessionId, unifiedSessionId);
      assert.equal(visit4.pageCount, 1);
      assert.equal(visit4.sessionDuration, 0);
    }, 'Visit 4 triggers inactivity timeout and generates distinct Session 2', `New Session ID: ${visit4.sessionId}`);

    const secondSessionId = visit4.sessionId;

    // -------------------------------------------------------------------------
    // VERIFY SESSION 1 FINALIZATION & SEGMENTATION IN DATABASE
    // -------------------------------------------------------------------------
    logStep(7, 'Verifying Closure of Session 1 and Segregation in Firestore');

    const closedSession1 = await trackingService.getSession(unifiedSessionId);

    countAssert(() => {
      assert.equal(closedSession1.is_active, false);
    }, 'Session 1 is marked inactive / closed in database');

    countAssert(() => {
      assert.equal(closedSession1.started_at, t0.toISOString());
      assert.equal(closedSession1.ended_at, t2.toISOString());
    }, 'Closed Session 1 start matches Visit 1 and end matches Visit 3', `start: ${closedSession1.started_at}, end: ${closedSession1.ended_at}`);

    countAssert(() => {
      assert.equal(closedSession1.duration_seconds, 660);
      assert.equal(closedSession1.page_count, 3);
    }, 'Closed Session 1 duration remains 660s with 3 pages');

    const activeSession2 = await trackingService.getSession(secondSessionId);

    countAssert(() => {
      assert.equal(activeSession2.is_active, true);
      assert.equal(activeSession2.started_at, t3.toISOString());
      assert.equal(activeSession2.page_count, 1);
      assert.equal(activeSession2.pages_visited[0].path, '/contact-advisor');
    }, 'Session 2 is active, started at Visit 4 timestamp with 1 page');

    // Verify database now contains exactly 2 sessions for this visitor
    const finalSessionsSnap = await firestore.collection('sessions')
      .where('visitor_id', '==', simulatedVisitorId)
      .get();

    countAssert(() => {
      assert.equal(finalSessionsSnap.size, 2);
    }, 'Database query confirms exactly 2 distinct sessions stored for visitor');

    // -------------------------------------------------------------------------
    // VERIFY BEHAVIORAL PROFILE GENERATION IN FIRESTORE
    // -------------------------------------------------------------------------
    logStep(8, 'Verifying Aggregate Behavioral Profile & Marketing Targeting in Firestore');

    const profileDoc = await trackingService.getProfile(simulatedVisitorId);

    countAssert(() => {
      assert.ok(profileDoc);
      assert.ok(profileDoc.behavioralProfile);
      assert.equal(profileDoc.behavioralProfile.totalSessions, 2);
      assert.equal(profileDoc.behavioralProfile.totalPageViews, 4);
      assert.equal(profileDoc.behavioralProfile.totalDurationSeconds, 660);
      assert.equal(profileDoc.behavioralProfile.primaryCategory, 'life-insurance');
      assert.ok(profileDoc.behavioralProfile.intentScore >= 40);
      assert.ok(Array.isArray(profileDoc.behavioralProfile.targetedAdRecommendations));
      assert.ok(profileDoc.behavioralProfile.targetedAdRecommendations.length > 0);
    }, 'Behavioral profile aggregates across sessions with intent score and targeted ad recommendations');

    // -------------------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------------------
    const elapsed = Date.now() - startTime;
    console.log(`\n${ANSI.green}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.log(`${ANSI.green}${ANSI.bold}  SESSION TRACKING VERIFICATION COMPLETED SUCCESSFULLY (100% PASS)${ANSI.reset}`);
    console.log(`${ANSI.green}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.log(`  • Total Assertions Verified : ${ANSI.bold}${totalAssertions}${ANSI.reset}`);
    console.log(`  • Execution Duration        : ${ANSI.bold}${elapsed} ms${ANSI.reset}`);
    console.log(`  • Unified Session ID        : ${unifiedSessionId}`);
    console.log(`  • Segmented Session ID      : ${secondSessionId}`);
    console.log(`  • Visitor Sessions in DB    : 2 sessions (Session 1: 3 visits / 660s, Session 2: 1 visit / 0s)`);
    console.log(`  • Primary Interest Detected : ${profileDoc.behavioralProfile.primaryCategory}`);
    console.log(`  • Intent Score Computed     : ${profileDoc.behavioralProfile.intentScore} / 100 (${profileDoc.behavioralProfile.qualification})`);
    console.log(`  • Exit Code                 : 0\n`);

    process.exit(0);

  } catch (error) {
    console.error(`\n${ANSI.red}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.error(`${ANSI.red}${ANSI.bold}  SESSION TRACKING VERIFICATION FAILED${ANSI.reset}`);
    console.error(`${ANSI.red}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.error(error.stack || error);
    process.exit(1);
  }
}

runSessionTrackingVerification();
