const path = require('path');
const express = require('express');
const cors = require('cors');

const planetsRouter = require('./routes/planets/planets.router');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'   // 假设客户端项目端口为3000
}));

app.use(express.json());
/**
 * 假设客户端打包后的文件放在了项目根目录的public目录下
 * 
 * 这使得我们可以在浏览器中通过访问 localhost:8000/index.html 来访问客户端项目
 */
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(planetsRouter);
/**
 * 虽然上面使用express.static已经将public目录下的文件暴露给了客户端
 * 
 * 但通常情况下我们访问网站首页是通过 localhost:8000 这样的路径而不是 localhost:8000/index.html
 * 
 * 下面的设置使得用户可以通过访问 localhost:8000 来访问localhost:8000/index.html
 */ 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;