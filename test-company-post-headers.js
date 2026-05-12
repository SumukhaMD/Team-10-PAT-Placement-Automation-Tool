const http = require('http');

const payload = JSON.stringify({
  name: "asd",
  email: "asd@asd.com",
  industry: "TECHNOLOGY",
  website: "",
  location: "",
  description: ""
});

const req = http.request({
  hostname: 'localhost',
  port: 8083,
  path: '/companies',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-User-Id': '1',
    'X-User-Email': 'admin@placeit.com',
    'X-User-Role': 'ADMIN'
  }
}, res => {
  console.log('Companies POST 8083 status:', res.statusCode);
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
