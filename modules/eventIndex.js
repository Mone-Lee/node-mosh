// const EventEmitter = require('events')
// const emitter = new EventEmitter()

// // Register a listener
// // 这个监听不会被触发，这里的emiter和eventLogger.js中的emiter不是同一个
// emitter.on('log', (arg) => {
//   console.log(arg)
// })


const Logger = require('./eventLogger');
const logger = new Logger();

// Register a listener
// 记得要先注册监听器，再触发事件
logger.on('log', (arg) => {
  console.log('listener called', arg)
})


// trigger an event
// 通过使用Logger类，可以控制事件的触发，比如这里，控制emit前先执行其他代码
logger.log('message');