/**
 * 实现自定义Readable流
 * 
 * 要点1：继承Readable类
 * 要点2：实现_read方法，并调用push方法将数据推送到内部缓冲区
 * 要点3：push（null）表示数据已经读取完毕
 * 要点4：获取数据有2种方式，一种是通过监听data事件，另一种是通过调用read方法（主动读取）
 */
const { Readable } = require('stream');

// mock 数据源
const source = ['a', 'b', 'c', 'd', 'e'];

class MyReadable extends Readable {
  constructor(source) {
    super();
    this.source = source;
  }

  // 要点2，重写Readable类的_read方法，在Readable类中仅定义了这个方法，但没有具体实现，需要子类实现
  _read() {
    let data = this.source.shift() || null; // 要点3，数据读取完毕后，push(null)
    this.push(data);  // 调用push方法将数据推送到内部缓冲区（内部缓冲区是一个单向链表结构）
  }
}

// 消费者
const readable = new MyReadable(source);

// 监听readable事件主动读取数据
readable.on('readable', () => {
  // 通过readable.read()触发从内部缓冲区读取数据，如果不调用，则处于暂停模式
  // read方法可传参数表示读取的字节数
  while((data = readable.read()) !== null) {
    console.log('data:', data.toString());
  }
})

// 监听data事件, 只要仍有数据，就会触发data事件
// 通过data事件获取数据时，源数据不会被推送到内部缓冲区，而是直接返回给消费者
readable.on('data', (data) => {
  console.log('data:', data.toString());
});