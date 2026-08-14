const express = require('express');
const http = require('http');
const signalwireRouter = require('../backend/routes/signalwire.cjs');

const app = express();
app.use(express.json());
app.use('/api/signalwire', signalwireRouter);

const server = http.createServer(app);

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/signalwire`;

  console.log(`[Challenger M3 Harness] Server running on ${baseUrl}`);
  let failed = false;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details ? '- ' + JSON.stringify(details) : ''}`);
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '- ' + JSON.stringify(details) : ''}`);
      failed = true;
    }
  };

  try {
    // 1. Dialing valid phone number (+15551234567)
    console.log('\n--- Test 1: Dialing valid phone number ---');
    const callRes = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: '+15551234567' })
    });
    const callBody = await callRes.json();
    assert(callRes.status === 200, 'POST /call HTTP status 200', { status: callRes.status });
    assert(callBody.success === true, 'POST /call response success === true', callBody.success);
    assert(typeof callBody.callId === 'string' && callBody.callId.length > 0, 'POST /call response callId is non-empty string', callBody.callId);
    assert(typeof callBody.status === 'string', 'POST /call response status is string', callBody.status);
    assert(typeof callBody.sid === 'string' && callBody.sid.startsWith('sw_call_'), 'POST /call response sid matches SignalWire format', callBody.sid);

    const callId = callBody.callId;

    // 2. Terminating call (POST /api/signalwire/hangup with callId)
    console.log('\n--- Test 2: Terminating call via POST /hangup ---');
    const hangupRes = await fetch(`${baseUrl}/hangup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callId: callId,
        durationSeconds: 25,
        status: 'completed'
      })
    });
    const hangupBody = await hangupRes.json();
    assert(hangupRes.status === 200, 'POST /hangup HTTP status 200', { status: hangupRes.status });
    assert(hangupBody.success === true, 'POST /hangup response success === true', hangupBody.success);
    assert(hangupBody.callId === callId, 'POST /hangup callId matches', hangupBody.callId);
    assert(hangupBody.status === 'completed', 'POST /hangup updated status === completed', hangupBody.status);
    assert(hangupBody.durationSeconds === 25, 'POST /hangup durationSeconds === 25', hangupBody.durationSeconds);

    // 3. Fetching call history (GET /api/signalwire/calls)
    console.log('\n--- Test 3: Fetching call history ---');
    const callsRes = await fetch(`${baseUrl}/calls`);
    const callsList = await callsRes.json();
    assert(callsRes.status === 200, 'GET /calls HTTP status 200', { status: callsRes.status });
    assert(Array.isArray(callsList), 'GET /calls returns array', { length: callsList.length });
    
    const loggedCall = callsList.find(c => c.id === callId || c.call_sid === callBody.sid);
    assert(!!loggedCall, 'Logged call found in call history', { callId, sid: callBody.sid });
    if (loggedCall) {
      assert(loggedCall.status === 'completed', 'Logged call status updated to completed in history', loggedCall.status);
      assert(loggedCall.to_number === '+15551234567', 'Logged call target number matches', loggedCall.to_number);
    }

    // 4. Testing invalid phone numbers
    console.log('\n--- Test 4: Invalid phone numbers ---');
    // Test 4a: 'abc'
    const invalidAbcRes = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'abc' })
    });
    assert(invalidAbcRes.status === 400, 'POST /call with to: "abc" returns HTTP 400', { status: invalidAbcRes.status });

    // Test 4b: '' (empty string)
    const invalidEmptyRes = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: '' })
    });
    assert(invalidEmptyRes.status === 400, 'POST /call with to: "" returns HTTP 400', { status: invalidEmptyRes.status });

    // Test 4c: '123' (too short)
    const invalidShortRes = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: '123' })
    });
    assert(invalidShortRes.status === 400, 'POST /call with to: "123" returns HTTP 400', { status: invalidShortRes.status });

    // 5. Additional edge cases: Hangup missing parameters
    console.log('\n--- Test 5: Edge cases ---');
    const noParamHangupRes = await fetch(`${baseUrl}/hangup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(noParamHangupRes.status === 400, 'POST /hangup without callId/callSid returns HTTP 400', { status: noParamHangupRes.status });

    // 6. Test /call/status route alias for hangup
    const statusCallRes = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: '+18005550199' })
    });
    const statusCallBody = await statusCallRes.json();
    const statusAliasRes = await fetch(`${baseUrl}/call/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callId: statusCallBody.callId,
        status: 'completed',
        durationSeconds: 15
      })
    });
    const statusAliasBody = await statusAliasRes.json();
    assert(statusAliasRes.status === 200, 'POST /call/status alias HTTP status 200', { status: statusAliasRes.status });
    assert(statusAliasBody.status === 'completed', 'POST /call/status alias sets status to completed', statusAliasBody.status);

    console.log('\n========================================');
    if (failed) {
      console.error('❌ CHALLENGE HARNESS RESULT: FAIL');
      process.exitCode = 1;
    } else {
      console.log('✅ CHALLENGE HARNESS RESULT: PASS');
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('Fatal harness exception:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
