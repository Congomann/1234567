const express = require('express');
const http = require('http');
const signalwireRouter = require('../../backend/routes/signalwire.cjs');

const app = express();
app.use(express.json());
app.use('/api/signalwire', signalwireRouter);

// Custom error handling middleware for JSON parse errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  next();
});

const server = http.createServer(app);

const runTests = () => {
  server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/api/signalwire`;

    console.log(`====================================================`);
    console.log(` EMPIRICAL STRESS TEST HARNESS — MILESTONE M3 `);
    console.log(`====================================================`);
    console.log(`Server listening on ${baseUrl}\n`);

    let passedTests = 0;
    let failedTests = 0;

    const assert = (condition, testName, details = '') => {
      if (condition) {
        console.log(`[PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
        passedTests++;
      } else {
        console.error(`[FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
        failedTests++;
      }
    };

    try {
      // ----------------------------------------------------
      // SECTION 1: EDGE CASE PAYLOADS & PARAMETER VARIATIONS
      // ----------------------------------------------------
      console.log(`--- SECTION 1: Edge Case Payloads & Contract Support ---`);

      // 1.1 Legacy `toNumber` support
      const resLegacy = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNumber: '+13125550188', advisorExtension: '102' })
      });
      const dataLegacy = await resLegacy.json();
      assert(resLegacy.ok && dataLegacy.success && dataLegacy.call.to_number === '+13125550188', 
             '1.1 Legacy parameter `toNumber` accepted correctly');

      // 1.2 Contract `to` support
      const resContract = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '+14155550199', extension: '103' })
      });
      const dataContract = await resContract.json();
      assert(resContract.ok && dataContract.success && dataContract.call.to_number === '+14155550199', 
             '1.2 Contract parameter `to` accepted correctly');

      // 1.3 `to` vs `toNumber` priority check (to should take priority if both provided)
      const resPriority = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '+14155550111', toNumber: '+14155550222' })
      });
      const dataPriority = await resPriority.json();
      assert(resPriority.ok && dataPriority.call.to_number === '+14155550111', 
             '1.3 Parameter `to` takes precedence over `toNumber` when both provided');

      // 1.4 Invalid Phone: Alphabetic string
      const resAlpha = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'invalid-phone-abc' })
      });
      assert(resAlpha.status === 400, '1.4 Alphabetic phone number returns HTTP 400');

      // 1.5 Invalid Phone: Too short (< 7 digits)
      const resShort = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '123' })
      });
      assert(resShort.status === 400, '1.5 Too short phone number (<7 digits) returns HTTP 400');

      // 1.6 Invalid Phone: Too long (> 15 digits)
      const resLong = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '12345678901234567890' })
      });
      assert(resLong.status === 400, '1.6 Too long phone number (>15 digits) returns HTTP 400');

      // 1.7 Phone with formatting symbols (spaces, dashes, parentheses)
      const resFormatted = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '+1 (312) 555-0188' })
      });
      const dataFormatted = await resFormatted.json();
      assert(resFormatted.ok && dataFormatted.success, 
             '1.7 Formatted phone number with spaces/dashes/parens accepted as valid digits');

      // 1.8 Empty Body {} on /call
      const resEmptyCall = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert(resEmptyCall.status === 400, '1.8 Empty request body on /call returns HTTP 400');

      // 1.9 Empty Body {} on /hangup
      const resEmptyHangup = await fetch(`${baseUrl}/hangup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert(resEmptyHangup.status === 400, '1.9 Empty request body on /hangup returns HTTP 400');

      // 1.10 Hangup Negative Duration (should floor to 0)
      const resNegDur = await fetch(`${baseUrl}/hangup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: dataContract.callId, durationSeconds: -50, status: 'completed' })
      });
      const dataNegDur = await resNegDur.json();
      assert(resNegDur.ok && dataNegDur.durationSeconds === 0, 
             '1.10 Negative duration in hangup is sanitized to 0');

      // 1.11 Hangup Float Duration (should floor/integerize)
      const resFloatDur = await fetch(`${baseUrl}/hangup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: dataContract.callId, durationSeconds: 78.9, status: 'completed' })
      });
      const dataFloatDur = await resFloatDur.json();
      assert(resFloatDur.ok && dataFloatDur.durationSeconds === 78, 
             '1.11 Floating-point duration in hangup is floored to integer');

      // 1.12 Malformed JSON Payload
      const resMalformed = await fetch(`${baseUrl}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: `{"to": "+13125550188"`
      });
      assert(resMalformed.status === 400, '1.12 Malformed JSON payload returns HTTP 400');

      // 1.13 SMS endpoint edge cases (missing messageText)
      const resSmsNoText = await fetch(`${baseUrl}/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '+13125550188' })
      });
      assert(resSmsNoText.status === 400, '1.13 SMS send missing message text returns HTTP 400');

      // 1.14 AI call endpoint edge cases (invalid phone number)
      const resAiInvalid = await fetch(`${baseUrl}/ai-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'invalid' })
      });
      assert(resAiInvalid.status === 400, '1.14 AI call invalid phone number returns HTTP 400');


      // ----------------------------------------------------
      // SECTION 2: CONCURRENCY & SIMULTANEOUS CALL LOAD
      // ----------------------------------------------------
      console.log(`\n--- SECTION 2: Concurrency & Rapid Simultaneous Calls ---`);

      // 2.1 20 Concurrent Call Creations
      const CONCURRENT_COUNT = 20;
      const callPromises = [];
      for (let i = 0; i < CONCURRENT_COUNT; i++) {
        callPromises.push(
          fetch(`${baseUrl}/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: `+1800555${1000 + i}`,
              leadName: `Concurrent Lead ${i + 1}`,
              extension: `${101 + (i % 4)}`
            })
          }).then(r => r.json())
        );
      }

      const concurrentCallResults = await Promise.all(callPromises);
      const allCallsSuccessful = concurrentCallResults.every(r => r.success && r.callId && r.sid);
      const uniqueCallIds = new Set(concurrentCallResults.map(r => r.callId));
      assert(allCallsSuccessful && uniqueCallIds.size === CONCURRENT_COUNT, 
             '2.1 20 simultaneous outbound calls created with unique IDs and 100% success');

      // 2.2 20 Concurrent Call Hangups
      const hangupPromises = concurrentCallResults.map((call, idx) => 
        fetch(`${baseUrl}/hangup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: call.callId,
            callSid: call.sid,
            durationSeconds: 10 + idx,
            status: 'completed'
          })
        }).then(r => r.json())
      );

      const concurrentHangupResults = await Promise.all(hangupPromises);
      const allHangupsSuccessful = concurrentHangupResults.every(r => r.success && r.status === 'completed');
      assert(allHangupsSuccessful, '2.2 20 simultaneous call hangups processed with 100% success');

      // 2.3 Rapid Sequential Loop (50 rapid calls & immediate hangups)
      let rapidSuccessCount = 0;
      const RAPID_TOTAL = 50;
      for (let i = 0; i < RAPID_TOTAL; i++) {
        const createRes = await fetch(`${baseUrl}/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: `+1888555${2000 + i}`, leadName: `Rapid Lead ${i}` })
        });
        const createData = await createRes.json();

        const hangupRes = await fetch(`${baseUrl}/hangup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: createData.callId, durationSeconds: i, status: 'completed' })
        });
        const hangupData = await hangupRes.json();

        if (createRes.ok && createData.success && hangupRes.ok && hangupData.success) {
          rapidSuccessCount++;
        }
      }
      assert(rapidSuccessCount === RAPID_TOTAL, 
             `2.3 Rapid sequential create-hangup loop (${RAPID_TOTAL}/${RAPID_TOTAL} passed cleanly)`);


      // ----------------------------------------------------
      // SECTION 3: STATE PERSISTENCE & DATA INTEGRITY
      // ----------------------------------------------------
      console.log(`\n--- SECTION 3: State Persistence & Query Verification ---`);

      // 3.1 Verify GET /calls returns all created call records
      const resAllCalls = await fetch(`${baseUrl}/calls`);
      const allCallsList = await resAllCalls.json();
      assert(resAllCalls.ok && Array.isArray(allCallsList), 
             '3.1 GET /api/signalwire/calls returns valid call list');
      
      const expectedMinimum = CONCURRENT_COUNT + RAPID_TOTAL + 2; // + initial baseline calls
      assert(allCallsList.length >= expectedMinimum, 
             `3.2 State persistence check: call store retains all ${allCallsList.length} records (expected >= ${expectedMinimum})`);

      // 3.3 Verify call details persistence (checking last rapid call entry)
      const lastCall = allCallsList[0]; // unshifted to top
      assert(lastCall && lastCall.status === 'completed' && typeof lastCall.duration_seconds === 'number', 
             '3.3 Persistence integrity: completed status and duration preserved accurately');

      // 3.4 Verify GET /extensions returns valid extensions array
      const resExts = await fetch(`${baseUrl}/extensions`);
      const extsList = await resExts.json();
      assert(resExts.ok && Array.isArray(extsList) && extsList.length >= 4, 
             '3.4 GET /api/signalwire/extensions returns 4 advisor extensions');

      // 3.5 Verify GET /sms/history returns valid SMS history
      const resSmsHist = await fetch(`${baseUrl}/sms/history`);
      const smsList = await resSmsHist.json();
      assert(resSmsHist.ok && Array.isArray(smsList) && smsList.length >= 2, 
             '3.5 GET /api/signalwire/sms/history returns SMS logs');


      console.log(`\n====================================================`);
      console.log(` TEST RESULTS SUMMARY `);
      console.log(`====================================================`);
      console.log(`TOTAL PASSED: ${passedTests}`);
      console.log(`TOTAL FAILED: ${failedTests}`);
      console.log(`OVERALL STATUS: ${failedTests === 0 ? 'PASS' : 'FAIL'}\n`);

      if (failedTests > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (err) {
      console.error('Unhandled exception during stress test:', err);
      process.exit(1);
    } finally {
      server.close();
    }
  });
};

runTests();
