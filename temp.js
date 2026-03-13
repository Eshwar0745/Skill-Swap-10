const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    const getReq = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/messages/connections',
      headers: { Authorization: 'Bearer ' + token }
    }, gRes => {
      let gData = '';
      gRes.on('data', chunk => gData += chunk);
      gRes.on('end', () => console.log(JSON.stringify(JSON.parse(gData), null, 2)));
    });
    getReq.end();
  });
});

req.write(JSON.stringify({email: 'alice@skillswap.com', password: 'Password123'}));
req.end();
