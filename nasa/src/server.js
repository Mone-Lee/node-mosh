const http = require('http');

const app = require('./app');

const PORT = process.env.PORT || 8000;

/**
 * 一般情况下，不需要特意使用http的实例，而是直接使用app.listen
 * 
 * 使用http.createServer创建实例的场景：
 * 1. 需要监听http的底层事件，如connection等, 常见的是websocket
 * 
 * 2. 有多个app实例时，先使用http实例对路由监听，从而导向对应的app实例
 * 
 */
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})