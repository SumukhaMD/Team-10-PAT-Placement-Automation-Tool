const http = require('http');

const payload = JSON.stringify({
  name: "asd",
  industry: "Technology",
  website: "test.com",
  location: "Bangalore",
  description: "desc"
});

const token = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzdW11a2hhYWNoYXJ5YTg5NTFAZ21haWwuY29tIiwidXNlcklkIjozLCJlbWFpbCI6InN1bXVraGFhY2hhcnlhODk1MUBnbWFpbC5jb20iLCJyb2xlIjoiVFBPIiwiaWF0IjoxNzc3MjY3ODcyLCJleHAiOjE3NzcyNjg3NzJ9.ohLIqblqtCX4Og6ebUryxP3CBdnThIzOKFdmQGOzhw3naLkwpJkhqL514fN55TcN";
const req = http.request({
  hostname: 'localhost',
  port: 8083,
  path: '/companies',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-User-Id': '3',
    'X-User-Role': 'TPO',
    'Authorization': `Bearer ${token}`
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
