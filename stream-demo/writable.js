/**
 * 自定义可写流
 * 
 * 可写流比较常用的方法是 pipe 和 drain
 */

const { Writable } = require('stream');

class MyWritable extends Writable {
  constructor(options) {
    super(options);
  }

  _write(chunk, encoding, callback) {
    process.stdout.write(chunk.toString());
    // 确保结束的回调函数在数据写完后再执行
    process.nextTick(callback);
  }
}

const writable = new MyWritable();
writable.write('hello', 'utf-8', () => {
  console.log('end');
});