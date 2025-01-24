const http = require('http');

const PORT = 3000;

// server 是一个eventEmitter实例
// 注意req和res实际是stream实例，这使得可以实现req.pipe(res)和req.on('data', (chunk) => {})这样的操作
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello World' }));
})

// 上面等同于
// server.on('request', (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify({ message: 'Hello World' }));
// })

server.listen(3000, () => {
  console.log(`Server is listening on port ${PORT}`);
})

