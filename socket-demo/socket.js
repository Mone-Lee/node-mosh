let playerCount = 0;

function listen(io) {
  io.on('connection', (socket) => {

    // 身份识别
    socket.on('ready', () => {
      // 通过socket.io的id，作为用户id，不需要自己生成
      console.log('A user connected', socket.id);
  
      playerCount++;
  
      if (playerCount === 2) {
        // io.emit会广播给所有连接的客户端
        // 通知所有客户端开始游戏，并将最后一个加入的客户端作为裁判，将其id传递给客户端
        io.emit('startGame', socket.id)
      }
    })
  
    // 不同客户端之间数据同步
    socket.on('paddleMove', (offsetX) => {
      // 广播给所有客户端(除了发送事件的客户端)，这里服务端其实只是一个“转发”的作用
      socket.broadcast.emit('paddleMove', offsetX);
    })
  })
}

module.exports = {
  listen
};