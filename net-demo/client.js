const net = require('net');

const client = net.createConnection({
  host: 'localhost',
  port: 1234,
});

// client实例是一个双工流
client.on('connect', () => {
  console.log('client connected');
  client.write('client: camille');
});

client.on('data', (chunk) => {
  console.log('client received data', chunk.toString());
});

client.on('close', () => {
  console.log('client closed')
})

client.on('error', (err) => {
  console.log('client error', err)
})