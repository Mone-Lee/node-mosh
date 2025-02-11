const net = require('net');

const server = net.createServer();

const PORT = 1234;
const HOST = 'localhost';
server.listen(PORT, HOST);

// 上面的listen方法会触发listening事件
server.on('listening', () => {
  console.log(`server is listening on ${HOST}:${PORT}`);
})

// 有新的连接(客户端建立连接)时触发connection事件，注意回调函数的参数是socket对象，一个双工流，可发送和接收数据
server.on('connection', (socket) => {
  socket.on('data', (chunk) => {
    const msg = chunk.toString();
    console.log(`server received data: ${msg}`);

    socket.write(Buffer.from(`hello ${msg}`));
  })
});

server.on('close', () => {
  console.log('server closed');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
  } else {
    console.log('server error', err)
  }
})