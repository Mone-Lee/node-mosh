Node

## 1. 基础

是一个 js 的运行环境，v8 + c++(提供浏览器没有的特性)
不是编程语言、也不是框架

### 特性：

#### 异步

高扩展性，即不用很多硬件设备（线程）即可处理多客户请求（I/O）的场景  
数据密集型、及时响应  
事件队列

#### 单线程

不适合计算密集型的场景，如图片渲染，这种需要 CPU 进行大量运算，但操作文件和网络很少  
当线程提供运算服务时，其他请求就需要等待了

## 2. 模块系统

一个文件就是一个模块  
在文件中可以直接打印 module 对象，console.log(module)  
文件中创建的变量和函数的作用域都在这个 module 中

### Module Wrapper Function

每一个模块代码，在 node 中并不会直接执行，而是被包裹在一个立即执行函数中

```
(function(exports, require, module, __filename, __dirname) {
// 模块代码
})
```

通过这个 module wrapper function，可以知道的事：

1. wrapper function 的 5 个参数，他们的作用域是模块之内，并不是全局变量，例如经常被误会为全局变量的 require。
2. exports 指向的是 module.exports，exports = module.exports。我们不能修改 exports（例： exports = log），这会导致错误。

### Node 内置模块

内置模块同样通过 require 引入，例如：require('path')  
node 对 require 的参数的查找顺序：

1. 判断是否为一个内置模块
2. 从对应的相对路径中获取模块。 例：require('./path')，判断不是内置模块，而查找相对路径。
3. 从 node_modules 中查找模块。

有很多内置模块其实都是基于 EventEmitter 实现的，例如：fs、net、http、stream、process 等。

### NPM

#### 包依赖

以前，包的自身依赖都会放在包自身的 node_modules 中。这会导致同一个包多次安装，造成文件夹嵌套过深，同时 windows 限制了文件夹包含对象的数量。  
现在，npm 会将包的依赖包都放在项目的 node_modules 中。但有例外，当不同的包对同一个包有不同版本的依赖时，仍然会在自身包里创建 node_modules 文件夹，并放置对应版本的依赖包。

#### 常用命令

```
// 登录npm，发布、更新包前需要登录
npm login

// 发布包
npm publish

// 更新包， 更新包前需要改版本号，可手动改，或使用命令npm version ...，然后再publish

// 更新版本号的path
npm version patch

// 更新版本号的minor
npm version minor

// 更新版本号的major
npm version major

npm publish

// 删除包
npm unpublish
```
