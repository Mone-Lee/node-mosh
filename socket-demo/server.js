const http = require('http');
const api = require('./api');
const socketIO = require('socket.io');
const socket = require('./socket');

const httpServer = http.createServer(api);
const io = socketIO(httpServer);

const PORT = 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})

socket.listen(io);