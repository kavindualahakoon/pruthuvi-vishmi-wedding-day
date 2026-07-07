const http = require('http');
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/content/upload-image',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.write('--' + boundary + '\r\n');
req.write('Content-Disposition: form-data; name="image"; filename="test.txt"\r\n');
req.write('Content-Type: text/plain\r\n\r\n');
req.write('Hello World\r\n');
req.write('--' + boundary + '--\r\n');
req.end();
