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

  console.log(`Test server running on ${baseUrl}`);

  try {
    // Test 1: GET /credentials
    const resCred = await fetch(`${baseUrl}/credentials`);
    const cred = await resCred.json();
    console.log('[Test 1 Credentials]:', cred.status === 'connected' ? 'PASS' : 'FAIL', cred);

    // Test 2: Invalid phone number (HTTP 400)
    const resInvalid = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'abc' })
    });
    console.log('[Test 2 Invalid Phone 400]:', resInvalid.status === 400 ? 'PASS' : 'FAIL', resInvalid.status);

    // Test 3: Initiate valid call with contract body { to: ... }
    const resCall = await fetch(`${baseUrl}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '+13125550188',
        leadName: 'Unit Test Lead',
        extension: '101'
      })
    });
    const callData = await resCall.json();
    console.log('[Test 3 Initiate Call]:', resCall.ok && callData.success && callData.status === 'in-progress' ? 'PASS' : 'FAIL', callData);

    // Test 4: Hangup call with duration
    const resHangup = await fetch(`${baseUrl}/hangup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callId: callData.callId,
        callSid: callData.sid,
        status: 'completed',
        durationSeconds: 42
      })
    });
    const hangupData = await resHangup.json();
    console.log('[Test 4 Hangup Call]:', resHangup.ok && hangupData.success && hangupData.durationSeconds === 42 ? 'PASS' : 'FAIL', hangupData);

    // Test 5: GET /calls check history return
    const resCalls = await fetch(`${baseUrl}/calls`);
    const callsList = await resCalls.json();
    console.log('[Test 5 GET Calls List]:', resCalls.ok && Array.isArray(callsList) && callsList.length > 0 ? 'PASS' : 'FAIL', `Count: ${callsList.length}`);

    console.log('\nAll API Verification Tests Complete!');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
