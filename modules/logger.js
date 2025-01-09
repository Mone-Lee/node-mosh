var URL = 'http://mylogger.io/log';

function log(message) {
  // Send an HTTP request
  console.log(message);
}

module.exports.log = log;

// 可以不导出对象，而直接将module.exports设置为一个函数
// module.exports = log;