const socket = io();

let isReferee = false;
let paddlePosition = [255, 256]; // 分别表示两个玩家的位置
let positionIndex = -1; // 0表示第一个玩家，1表示第二个玩家

function loadGame() {
  socket.emit("ready");
  positionIndex++;

  window.addEventListener("mousemove", (e) => {
    socket.emit("paddleMove", e.offsetX);
  })
}

loadGame();

socket.on("connect", () => {
  // 通过socket.io的id，作为用户id，不需要自己生成
  console.log("Connected to server as user", socket.id);
})

socket.on("startGame", (refereeId) => {
  console.log('referee id is', refereeId);

  isReferee = refereeId === socket.id;
  if (isReferee) {
    console.log("You are the referee");
  }
});

socket.on("paddleMove", (offsetX) => {
  // 计算另一个玩家的index
  let oppositionIndex = 1 - positionIndex;
  // 更新另一个玩家的坐标
  paddlePosition[oppositionIndex] = offsetX;
});

