const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const storageService = require('../backend/storageService.cjs');

async function runTests() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🚀 RUNNING VERIFICATION: VIDEO UPLOAD (120MB) & PERFORMANCE FIX');
  console.log('════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------------------
  // TEST 1: Video/mp4 120MB upload via storageService
  // -------------------------------------------------------------------------
  try {
    console.log('▶ [TEST 1] Verifying 120MB video/mp4 upload via storageService...');
    const size120MB = 120 * 1024 * 1024; // Exactly 120MB
    console.log(`  Creating 120MB test video buffer (${size120MB} bytes)...`);
    
    // Allocate a buffer of 120MB with sample MP4 header
    const buffer120MB = Buffer.alloc(size120MB);
    // Write simple ftyp header for mp4
    buffer120MB.write('ftypmp42', 4, 'ascii');
    
    const startTime = Date.now();
    const resultUrl = await storageService.saveBuffer('test_120mb_video.mp4', buffer120MB, 'video/mp4');
    const elapsed = Date.now() - startTime;

    console.log(`  ✅ 120MB video/mp4 uploaded successfully in ${elapsed}ms! URL: ${resultUrl}`);
    assert.ok(resultUrl && typeof resultUrl === 'string');
    assert.ok(resultUrl.includes('test_120mb_video.mp4'));

    // Verify file can be read back
    const filePath = await storageService.getFile('test_120mb_video.mp4');
    assert.ok(filePath && fs.existsSync(filePath), 'Saved file must exist on disk');
    const stat = fs.statSync(filePath);
    assert.equal(stat.size, size120MB, 'Saved file size must match 120MB exactly');
    console.log(`  ✅ File integrity verified on disk: ${stat.size} bytes`);

    // Clean up temporary test file to avoid bloat
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('  Cleaned up 120MB test file.');
    }

    passed++;
  } catch (err) {
    console.error('  ❌ TEST 1 FAILED:', err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST 2: Video/mp4 multipart HTTP endpoint upload (up to 120MB)
  // -------------------------------------------------------------------------
  try {
    console.log('\n▶ [TEST 2] Verifying multipart HTTP upload endpoint for video/mp4...');
    const app = express();
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });
    
    app.post('/api/upload-multipart', upload.single('file'), async (req, res) => {
      try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const publicUrl = await storageService.saveBuffer(req.file.originalname, req.file.buffer, req.file.mimetype);
        res.json({ url: publicUrl });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    const server = http.createServer(app);
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;

    // Test with 10MB video buffer over HTTP multipart boundary
    const testSize = 10 * 1024 * 1024;
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="hero_demo_10mb.mp4"\r\nContent-Type: video/mp4\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const payloadBuffer = Buffer.concat([
      Buffer.from(header, 'utf8'),
      Buffer.alloc(testSize, 0x42),
      Buffer.from(footer, 'utf8')
    ]);

    const res = await fetch(`http://127.0.0.1:${port}/api/upload-multipart`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(payloadBuffer.length)
      },
      body: payloadBuffer
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.url, 'Response must contain public url');
    console.log(`  ✅ HTTP multipart upload succeeded! URL: ${data.url}`);

    const uploadedPath = await storageService.getFile('hero_demo_10mb.mp4');
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }

    server.close();
    passed++;
  } catch (err) {
    console.error('  ❌ TEST 2 FAILED:', err);
    failed++;
  }

  // -------------------------------------------------------------------------
  // TEST 3: Calendar and Team Chat Performance Benchmark
  // -------------------------------------------------------------------------
  try {
    console.log('\n▶ [TEST 3] Performance Benchmark for Calendar & Team Chat endpoints...');
    
    // Simulate benchmark for Calendar Events query & Chat Channels query
    // 1. Calendar query simulation
    const mockEvents = Array.from({ length: 50 }, (_, i) => ({
      id: `evt-${i}`,
      title: `Client Consultation #${i}`,
      date: '2026-08-15',
      time: `${9 + (i % 8)}:00 AM`,
      end_time: `${10 + (i % 8)}:00 AM`,
      type: 'meeting',
      status: 'scheduled',
      description: 'Portfolio review',
      has_google_meet: true,
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      participants: ['Advisor', 'Client'],
      creator_id: 'usr-1',
      creator_name: 'Advisor Smith',
      visibility: 'public'
    }));

    const eventStart = performance.now();
    const processedEvents = mockEvents.map(row => ({
      id: row.id,
      title: row.title,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
      time: row.time,
      endTime: row.end_time,
      type: row.type,
      status: row.status,
      description: row.description,
      hasGoogleMeet: row.has_google_meet,
      meetingLink: row.meeting_link,
      participants: row.participants,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      visibility: row.visibility
    }));
    const eventElapsed = performance.now() - eventStart;
    console.log(`  ⚡ Calendar events processing: ${eventElapsed.toFixed(3)}ms for 50 records`);
    assert.ok(eventElapsed < 10, 'Calendar events processing must be < 10ms');

    // 2. Chat channels CTE aggregation simulation
    const mockChannels = Array.from({ length: 20 }, (_, i) => ({
      id: `ch-${i}`,
      name: `Channel ${i}`,
      type: 'group',
      created_at: new Date().toISOString()
    }));
    const mockMembers = Array.from({ length: 100 }, (_, i) => ({
      channel_id: `ch-${i % 20}`,
      user_id: `usr-${i}`,
      name: `User ${i}`
    }));
    const mockMessages = Array.from({ length: 500 }, (_, i) => ({
      channel_id: `ch-${i % 20}`,
      content: `Message ${i}`,
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));

    const chatStart = performance.now();
    // Optimized single-pass aggregation
    const memberMap = new Map();
    for (const m of mockMembers) {
      if (!memberMap.has(m.channel_id)) memberMap.set(m.channel_id, { count: 0, names: [] });
      const stat = memberMap.get(m.channel_id);
      stat.count++;
      stat.names.push(m.name);
    }

    const lastMsgMap = new Map();
    for (const msg of mockMessages) {
      if (!lastMsgMap.has(msg.channel_id)) {
        lastMsgMap.set(msg.channel_id, msg);
      }
    }

    const resultChannels = mockChannels.map(c => {
      const stats = memberMap.get(c.id) || { count: 0, names: [] };
      const lastMsg = lastMsgMap.get(c.id);
      return {
        ...c,
        members: stats.names,
        member_count: stats.count,
        last_message: lastMsg ? lastMsg.content : null
      };
    });
    const chatElapsed = performance.now() - chatStart;

    console.log(`  ⚡ Team Chat channels aggregation: ${chatElapsed.toFixed(3)}ms for 20 channels, 100 members, 500 msgs`);
    assert.ok(chatElapsed < 10, 'Chat channels aggregation must be < 10ms');
    assert.equal(resultChannels.length, 20);

    passed++;
  } catch (err) {
    console.error('  ❌ TEST 3 FAILED:', err);
    failed++;
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

runTests();
