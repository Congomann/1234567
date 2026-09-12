const http = require('https');

const data = JSON.stringify({
  lead_id: "test_google_123",
  campaign_id: "campaign_xyz",
  user_column_data: [
    { column_id: "FULL_NAME", string_value: "John Doe" },
    { column_id: "EMAIL", string_value: "johndoe@example.com" },
    { column_id: "PHONE_NUMBER", string_value: "555-123-4567" }
  ]
});

const options = {
  hostname: 'newhollandfinancial.com',
  port: 443,
  path: '/api/webhooks/google',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
