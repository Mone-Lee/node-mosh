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