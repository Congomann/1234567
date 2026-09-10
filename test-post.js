const http = require('http');

const data = JSON.stringify({
  id: "00000000-0000-0000-0000-000000000000",
  title: "Test Event",
  date: "2024-03-24",
  time: "",
  endTime: "",
  type: "meeting"
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
