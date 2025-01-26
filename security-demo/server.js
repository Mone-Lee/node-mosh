/**
 * 使用https
 */

const https = require('https');
const express = require('express');
const fs = require('fs');

const PORT = 3000;

const app = express();

app.get('/secret', (req, res) => {
  return res.send('The secret code is 11');
})

app.get('/', (req, res) => {
  res.send('Hello World!');
})

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
})