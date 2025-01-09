/**
 * 1. 全局对象 window 和 global
 * 
 * 浏览器中，全局对象是 window，而在 Node.js 中，全局对象是 global。
 * 
 * 全局对象的内容能在项目中任意地方获取。
 * 
 * 一些全局方法是挂载在全局对象上的，比如 console、setTimeout、clearTimeout 等。
 * window.console.log('hello world'); 
 * js 引擎会自动补全window.前缀，所以可以省略
 * 
 * 
 * 注意：全局变量
 * 在浏览器中，全局变量会自动成为 window 对象的属性，而在 Node.js 中，全局变量不会自动成为 global 对象的属性。
 * 如下面的2个输出
 */
var message = 'global message';

// console.log(window.message); // global message
// console.log(global.message); // undefined



/**
 * 2. 模块对象 module
 * 
 * 在node中，每个文件就是一个模块，每个模块都有一个 module 对象，它代表当前模块。
 */
console.log(module);

const logger = require('./logger');
logger.log('message');


// 内置模块

// 1. path 模块
const path = require('path');
var pathObj = path.parse(__filename);
console.log(pathObj);

// 2. os 模块
const os = require('os');
const totalMemory = os.totalmem();
const freeMemory = os.freemem();
console.log(`Total Memory: ${totalMemory}`);
console.log(`Free Memory: ${freeMemory}`);

// 3. fs 模块
const fs = require('fs');
// 同步读取文件
const files = fs.readdirSync('./');
console.log(files);

// 建议永远只用异步的方法
fs.readdir('./', (err, files) => {
    if (err) {
      console.log('Error: ', err);
    }
    console.log('Success: ', files);
})


// 4. events 模块
/**
 * 关于事件模块，有很多需要注意的细节：
 */
// 细节1：events模块返回的是一个类，不是对象、函数，所以EventEmitter按照类的习惯首字母大写
const EventEmitter = require('events');

// 细节2：EventEmitter 是一个类，所以我们需要创建一个 EventEmitter 的实例
const emitter = new EventEmitter();

// 细节3：事件监听器的注册一般用on和addListener方法，这2个方法实际是一样的，但on更常用
emitter.on('messageLogged', function() {
  console.log('Listener called');
});

// 细节4：事件监听的注册一定要先于触发，否则emit的时候遍历找不到对应的监听器，则代码运行效果不理想
emitter.emit('messageLogged');

emitter.on('messageLoggedWithArguments', (arg) => {
  console.log('Listener called with arguments: ', arg);
});

emitter.emit('messageLoggedWithArguments', { id: 1, url: 'http://' });

// 细节5！！！：在实际开发中，其实很少直接使用EventEmitter的实例，而是通过继承EventEmitter来实现自定义的类
// 详情参考./eventLogger.js文件和./eventIndex.js文件


// 5. http 模块
const http = require('http');

// 当路由很多时，这里的代码会变得很复杂，所以需要使用框架，比如express
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.write('Hello World');
    res.end();
  }

  if (req.url === '/api/courses') {
    res.write(JSON.stringify([1, 2, 3]));
    res.end();
  }
})

server.listen(3000);

console.log('Listening on port 3000...');