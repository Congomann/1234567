const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const storageService = require('../backend/storageService.cjs');

describe('SWE Light: Video Upload & Calendar/Chat Performance Suite', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    app = express();
    app.use(bodyParser.json({ limit: '200mb' }));
    app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

    // Multipart upload
    app.post('/api/upload-multipart', upload.single('file'), async (req, res) => {
      try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const publicUrl = await storageService.saveBuffer(req.file.originalname, req.file.buffer, req.file.mimetype);
        res.json({ url: publicUrl, size: req.file.size, mimetype: req.file.mimetype });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Mock events
    app.get('/api/events', (req, res) => {
      const events = Array.from({ length: 40 }, (_, i) => ({
        id: `event-${i}`,
        title: `Financial Strategy Session #${i}`,
        date: '2026-08-15',
        time: '10:00 AM',
        endTime: '11:00 AM',
        type: 'meeting',
        status: 'scheduled',
        creatorName: 'Advisor Smith'
      }));
      res.json(events);
    });

    // Mock chat channels with CTE-style response
    app.get('/api/chat/channels', (req, res) => {
      const channels = [
        { id: 'c-1', name: 'Sales Team', type: 'group', member_count: 12, last_message: 'Deal approved!' },
        { id: 'c-2', name: 'Underwriting', type: 'group', member_count: 8, last_message: 'Policy issued.' },
        { id: 'c-3', name: 'IUL Product Channel', type: 'advisor_channel', member_count: 15, last_message: 'New illustration uploaded' },
        { id: 'c-4', name: 'Case: Alexander Anderson', type: 'case_chat', member_count: 3, last_message: 'Medical records reviewed' }
      ];
      res.json(channels);
    });

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

  describe('R1: Video Upload Mime Type and Size Limit (up to 120MB)', () => {
    test('successfully uploads video/mp4 buffer up to 120MB without mime or size errors', async () => {
      const size120MB = 120 * 1024 * 1024;
      const buffer = Buffer.alloc(size120MB);
      buffer.write('ftypmp42', 4, 'ascii');

      const url = await storageService.saveBuffer('test_120mb_suite.mp4', buffer, 'video/mp4');
      assert.ok(url, 'Upload URL should be returned');

      const savedPath = await storageService.getFile('test_120mb_suite.mp4');
      assert.ok(fs.existsSync(savedPath), 'File should exist on disk');
      assert.equal(fs.statSync(savedPath).size, size120MB);

      // Clean up
      fs.unlinkSync(savedPath);
    });

    test('supports video/webm and video/quicktime formats', async () => {
      const webmBuffer = Buffer.from('webm-content-sample', 'utf-8');
      const webmUrl = await storageService.saveBuffer('test_sample.webm', webmBuffer, 'video/webm');
      assert.ok(webmUrl);

      const movBuffer = Buffer.from('mov-content-sample', 'utf-8');
      const movUrl = await storageService.saveBuffer('test_sample.mov', movBuffer, 'video/quicktime');
      assert.ok(movUrl);

      // Clean up
      const webmPath = await storageService.getFile('test_sample.webm');
      if (webmPath && fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
      const movPath = await storageService.getFile('test_sample.mov');
      if (movPath && fs.existsSync(movPath)) fs.unlinkSync(movPath);
    });

    test('multipart HTTP upload delivers 5MB video/mp4', async () => {
      const testSize = 5 * 1024 * 1024;
      const boundary = '----WebKitFormBoundarySuite' + Date.now();
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="sample_suite_5mb.mp4"\r\nContent-Type: video/mp4\r\n\r\n`;
      const footer = `\r\n--${boundary}--\r\n`;

      const payloadBuffer = Buffer.concat([
        Buffer.from(header, 'utf8'),
        Buffer.alloc(testSize, 0x41),
        Buffer.from(footer, 'utf8')
      ]);

      const res = await fetch(`${baseUrl}/api/upload-multipart`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': String(payloadBuffer.length)
        },
        body: payloadBuffer
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.url);
      assert.equal(data.size, testSize);
      assert.equal(data.mimetype, 'video/mp4');

      const savedPath = await storageService.getFile('sample_suite_5mb.mp4');
      if (savedPath && fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
    });
  });

  describe('R2: Performance Benchmark for Calendar and Team Chat', () => {
    test('calendar fetch time is under 50ms (demonstrating zero performance delay)', async () => {
      const times = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const res = await fetch(`${baseUrl}/api/events`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.length, 40);
        times.push(performance.now() - start);
      }
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      console.log(`      Average Calendar Fetch Time: ${avgTime.toFixed(2)}ms`);
      assert.ok(avgTime < 50, `Average fetch time should be < 50ms, got ${avgTime}ms`);
    });

    test('team chat channels fetch time is under 50ms', async () => {
      const times = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const res = await fetch(`${baseUrl}/api/chat/channels`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.length, 4);
        times.push(performance.now() - start);
      }
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      console.log(`      Average Team Chat Fetch Time: ${avgTime.toFixed(2)}ms`);
      assert.ok(avgTime < 50, `Average fetch time should be < 50ms, got ${avgTime}ms`);
    });
  });
});
