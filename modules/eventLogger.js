// const EventEmitter = require('events');
// // 当直接使用EventEmitter的实例时，如果事件的触发和监听在两个不同文件（模块），
// // 会导致每个文件都创建一个EventEmitter实例，
// // 这些EventEmitter实例不是同一个，所以无法触发事件和监听事件
// const emitter = new EventEmitter();

// function log(message) {
//   console.log(message);

//   emitter.emit('log', { message: 'message' });
// }


// module.exports = log;



/**
 * 实际地开发中，一般创建一个继承自EventEmitter的类，然后创建这个类的实例，这样就可以实现事件的触发和监听
 */
const EventEmitter = require('events');
class Logger extends EventEmitter {
  log(message) {
    console.log(message);

    // 由于Logger类继承自EventEmitter，所以可以直接使用emit方法触发事件
    this.emit('log', { message });
  }
}

module.exports = Logger;