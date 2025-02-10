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

### 模块加载核心逻辑

1. 路径分析  
   查找 require()传入的参数所指向的文件或模块：

   - 如果是路径，则根据当前文件的路径进行查找，类似调用 path.resolve()
   - 如果找不到拼接后的绝对路径找不到文件，尝试补足文件扩展名（.js、.json、 .node），再根据当前文件的路径查找该目录下的对应扩展名的文件
   - 如果不是路径，则判断为一个目录名，则
     - 根据当前文件的路径查找该目录下的 package.json 文件
       - 如果存在，则根据 package.json 文件中的 main 字段查找模块
       - 如果不存在，则查找该目录下的 index.js 文件
     - 如果 index.js 文件也不存在，则根据 module.paths 数组中的路径（node_modules）查找模块

2. 缓存优先  
   防止一个文件中重复引入同一个模块时，模块重复加载执行，提高性能。

3. 文件定位  
   判断文件扩展名，根据扩展名调用不同的编译方法。一般只判断扩展名.js、.json、.node。

4. 编译执行  
   （由于使用的是同步读取，所以 commonjs 的特征之一是“同步加载”）
   - 如果是.js，则调用 fs 模块**同步**读取文件，然后使用 vm 模块生成一个函数，传入模块对象，并执行该函数。
   - 如果是.json，则调用 fs 模块**同步**读取文件，然后使用 JSON.parse() 解析文件内容，并返回解析后的对象。

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

## 3. JWT

<span id="jwt">JSON Web Token</span>  
是一个渲染成长字符串的 JSON 对象，用于在客户端和服务器之间安全地传输信息。  
JWT 是一种紧凑的、URL 安全的表示，用于在各方之间安全地通过 JSON 对象传递信息。  
它由三部分组成：头部（header）、载荷（payload）、签名（signature）。

1. header 是标准化的内容，可以忽略
2. payload 可以存放一些自定义的信息，比如用户的 id，这样服务器获取 token 后，解析 token 即可获取信息，不用查找数据库
3. signature 是对 payload 和秘钥（存放在服务器， 如下面的'jwtPrivateKey'）进行加密后的结果，用于验证 token 是否被篡改
   注意：秘钥需要用环境变量存储，不要明文放在代码中。所以生成 token 需要自定义的有 payload 和秘钥

```
const token = jwt.sign({ id: this._id, isAdmin: this.isAdmin },  'jwtPrivateKey');
```

### 实际应用流程

1. 用户登录，服务器验证用户名和密码，验证通过后，生成 token，返回给客户端

```
// 登录路由
router.get('/', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(404).send('User already registered.');

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  // 加密password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  /**
   * 注意： token不要存在数据库中。
   *
   * 万一数据库被黑，token也会被盗，那么黑客就可以用token登录你的账号
   *
   */
  const token = await jwt.sign({id: user._id}, 'jwtPrivateKey');

  // 将token放在响应头中，客户端获取后，存储在本地
  res.header('x-auth-token', token).send(user);
});
```

2. 客户端将 token 存储在本地，如 localStorage，每次请求时，将 token 放在请求头中  
   注意：由于 token 存储在客户端，那么无需再服务器端实现登出，最好通过在客户端删除 JWT 来实现。
3. 服务器验证 token（为通用，使用验证中间件），验证通过后，返回请求结果

```
// 验证token的中间件
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    // jwt.verify() 方法验证 token 并返回解码后的对象，即payload
    const decode = jwt.verify(token, 'jwtPrivateKey');
    // 将解码后的对象存放在 req.user 中，这样在后续的路由或其他中间件中，可以直接获取到用户信息，而不用去数据库查找
    req.user = decode;
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}
```

### 如何保证 JWT 在客户端和服务器之间传输的安全性？

JWT 的一个特性是，它不可被篡改（通过自身包含的 signature 来校验，只有拥有 signature 中的 secret 的服务器才能够创建新的有效的 token 并修改 payload），但它可被任何人解码从而查看里面的详细信息，即它不是加密的。

1. 传输时，使用 HTTPS 协议，保证数据传输的安全性
2. 服务器端存储秘钥，客户端无法获取，即使获取了，也无法生成 token，因为秘钥是加密的
3. token 的有效期，防止 token 被盗用后，一直有效
4. 客户端存储：将 token 存储在客户端的 localStorage 或 sessionStorage 中，避免将 token 存储在不安全的地方（如 window 对象）。或者将 JWT 存储在 HttpOnly Cookie 中，这样可以防止 JavaScript 代码访问 Cookie，从而减少 XSS 攻击的风险。

## 4. 错误捕捉和处理

### 1. 代码逻辑错误

使用 try...catch 捕捉错误

### 2. 请求错误

使用错误处理中间件

### 3. express 等框架外的错误

process 监听事件。  
一般捕捉错误后，需要退出程序 process.exit(1)，因为此时程序处于挂起状态，这会造成很多问题，最好重启进程回复它的状态。  
如果是生产环境，则使用进程管理自动重启。

```
  // 捕捉同步错误
  process.on('uncaughtException', (ex) => {
    // 处理错误
  })

  // 捕捉异步错误
  process.on('unhandledRejection', (ex) => {
    // 处理错误
  })
```

## 5. 单元测试

### 使用场景

单元测试主要用于没有或很少外部依赖（如数据库、express 框架）的代码。  
考察是否对代码进行单元测试，需要看是否容易模拟外部依赖。  
如下面代码

```
router.get('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 其它代码
})
```

如果我们想要对这里的 async 函数进行单测，我们需要模拟 req 和 res 对象，构造 status 方法和 send 方法，这需要我们了解 express 框架的源码，这显然是不现实的。  
所以不考虑实现单元测试，而是使用集成测试（集成测试在下面）。

### 注意点

1. 文件名以 .test.js(x) 结尾
2. 当单测中访问环境变量时，访问的是测试环境的变量，需要保证设置正确

## 6. 集成测试

集成测试用于我们有很多外部依赖的时候。  
例如路由（即 api），这使得我们需要模拟很多外部依赖，如数据库、express 框架等。

### 使用步骤

1. 准备一个实际的数据库，使用数据库的数据来进行测试
   注意不要混用了生产环境的数据库
2. 发送请求
3. 使用断言，检查返回结果，断言中包含实际的返回数据

### 注意点

1. 集成测试中，由于使用了真实的数据库、框架功能，需要确保每次测试后数据库和框架的状态都是和开始测试前一致，如清除模拟插入数据库中的数据，框架销毁等。

## 7. 事件循环（Event loop）

事件循环是 libuv 中的一个重要概念，它使得 Node.js 可以处理异步代码，如定时器、文件 I/O、网络请求等。

### 1. 事件循环的机制

1. 当异步代码执行完成后，会将回调函数放入任务队列。
   比如 setTimeout(() => { console.log('hello') }, 1000)，当 1000 毫秒后，回调函数会被放入任务队列。
2. 事件循环从任务队列中取出一个任务，执行该任务
3. 执行完任务后，检查是否有新的任务加入任务队列，如果有，则继续执行新的任务
4. 如果没有新的任务加入任务队列，则事件循环进入空闲状态，等待新的任务加入任务队列

需要注意的是，会执行任务队列中所有的任务，才会进入空闲状态。同时任务队列不只一个，根据事件循环的不同阶段，会放入不同的任务队列中。

### 2. 事件循环的阶段

事件循环的几个重要阶段：

1. timers 阶段：执行 setTimeout 和 setInterval 的回调函数
2. I/O callbacks 阶段：执行几乎所有的回调函数，除了 timers、close callbacks、setImmediate 的回调函数
3. check 阶段（setImmediate 阶段）：执行 setImmediate 的回调函数
4. close callbacks 阶段：执行 close 事件的回调函数

每个阶段都有自己的任务队列。当事件循环进入某个阶段时，会执行该阶段的所有任务，直到任务队列为空，才会进入下一个阶段。  
事件循环的每个循环被称为一个"tick"，在每个 tick 中，事件循环按顺序执行完所有阶段的任务队列，然后进入下一个 tick。

## 8. node 性能优化

### 性能问题

node 的主要运行机制，是将接受到的任务通过 event loop 抛给线程池和操作系统。线程池和操作系统都能使用多线程来优化性能，主要影响 node 性能的是 event loop 本身是单线程，容易被阻塞，从而导致后续的所有任务都被阻塞。

代码中可能导致 event loop 被阻塞的场景：

1. 过多使用 JSON.stringify 和 JSON.parse，比如在日志打印的时候
2. 大数组的排序、循环等操作
3. 循环

注意：有一些东西是故意设计成计算很慢的，比如用来给用户密码加密的 crypto，这是为了增加黑客的计算成本，防止黑客在短时间内进行大量计算。

### 优化手段

1. cluster 模块  
   cluster 模块将多个子进程（**注意，不是线程**）绑定到同一个端口，从而实现多核 CPU 的并行计算。这使得我们需要注意 listen 监听端口的代码要写在子进程里。  
   主进程（master）通过管理子进程（worker）来实现负载均衡。主进程分配任务的方式是通过轮转法，即每次分配一个任务给一个子进程，然后继续分配下一个任务给下一个子进程，直到所有任务都被分配完毕。现实中可能出现一个子进程的任务耗时很长，另一个子进程的任务耗时很短，导致负载不均衡。但实际这种简单的轮转法比通过权重等分配任务的方法更高效和实用。  
   注意，Windows 系统会有点区别，可能不使用轮转法分配任务。

   1. pm2  
      在**生产环境**，我们更常用 pm2 来管理进程，而不是 cluster 模块。pm2 是一个进程管理工具，它可以帮助我们管理多个进程，实现负载均衡，自动重启进程等功能。pm2 还提供了很多其他功能，如日志管理、性能监控等。  
      pm2 使得我们的代码保持最简单的状态，而不需要引入 cluster 模块，也不需要关心进程管理的问题。仅需要在启动时，使用 pm2 的相关命令，而不是使用 node server.js 这样的命令。

2. worker threads  
   worker threads 是 Node.js 10.5.0 版本引入的一个新特性，它允许我们在一个进程中创建多个线程，从而实现多线程并行计算。内部是基于 web worker。worker threads 的使用方式和 cluster 模块类似，但是 worker threads 是在同一个进程内创建的，所以它们可以共享内存，从而实现更高效的并行计算。  
   worker threads 的使用场景是，当我们的代码中有一些计算密集型的任务，而这些任务不需要访问外部资源，如数据库、网络请求等（这些更适合由 cluster 来进行优化），那么我们可以使用 worker threads 来实现多线程并行计算，从而提高性能。

## 9. https 安全

node 中实现 https，需要使用内建的 https 模块。这允许我们实现 self-signed certificate，即自签名证书(另一种证书则是 CA 证书)。

### 使用 openSSL 生成自签名的证书

```
// req 表示要求一个新的证书
// -x509 表示这是一个自签名证书
// -newkey rsa:4096 表示生成一个新的 RSA 密钥，长度为 4096 位(越长则密码越强，一般为4096)
// -nodes 表示不使用密码保护证书（由于我们只在开发环境使用这个自签名证书，为免增加输入量，则设为不需要密码）
// -keyout server.key 表示将私钥保存到 server.key 文件中
// -out server.cert 表示将证书保存到 server.cert 文件中 （证书是公开的，浏览器通过证书来检查服务器的所有权）
// -days 365 表示证书的有效期为 365 天

openssl req -nodes -x509 -newkey rsa:4096 -nodes -keyout server.key -out server.cert -days 365
```

### 使用 https 模块创建实例，并引入秘钥和证书

```js
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("./server.key"), // 注意需要使用fs读取对应的文件内容，而不是传入文件路径
  cert: fs.readFileSync("./server.cert"),
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
});
// 如果我们在上面使用express实例做了一些东西，则createServer的回调函数中，可以传入express实例
// https.createServer(options, app)
// .listen(3000, () => {
//   console.log('HTTPS server running on port 3000');
// });
```

## 10. 认证和授权

### api key

api key 是一个字符串。api key 的 2 个作用：

1. 识别用户身份  
   有时我们查看网站的源代码，会发现代码中**明文**写着 api key。这是因为这个 api key 仅用来表示是哪个 app 或项目在调用 api 或者 sdk。
2. 限制某个身份对 api 的调用
   有时我们希望限制某个身份对 api 的调用，比如限制某个 app 或项目对 api 的调用次数。这时，我们可以使用 api key 来实现。  
   api key 的实现方式是，在每次调用 api 时，将 api key 作为参数（query 或者请求头）传递给 api。api 在接收到请求后，会检查 api key 是否有效，如果无效，则拒绝请求。

### JWT

JWT 同 api key 一样，都用于唯一地识别一个 app 的特定用户。但 JWT 更多的是作为用户的凭证，表示该用户是否有权限访问某个 api。同时，由于 JWT 结构的特殊性，它的 payload 可以携带更多信息。  
[更多信息](#jwt)

### oauth

一般使用的是 oauth 2.0 的版本。oauth 是一种授权机制，用于让第三方应用获取用户在某个平台上的授权。比如，我们使用 google 账号登录某个 app，这时 app 就会向 google 申请 oauth 授权，google 会返回一个授权码，app 使用这个授权码向 google 申请用户的身份信息。

优点：

1. 安全性高，因为 oauth 授权码是 google 生成并返回的，只有 google 才能解密。
2. 可以限制第三方应用获取用户的哪些信息，比如只获取用户的邮箱地址，不获取用户的密码。
3. 用户需要记住的账号密码更少。

## 11. Buffer

1. Buffer 是一个全局对象，不需要 require
2. 是一片内存空间，用来存储二进制数据
3. 这个内存空间独立于 v8 的堆内存。但仍然由 node 进行管理和 gc
4. Buffer 一般与 stream 一起使用，当数据消费速度小于数据生产速度时，就需要 buffer 存储产生的数据

### Buffer 实例的创建

Buffer 在 Node 中是一个类，但一般不适用 new 直接创建实例，因为这种创建方式给了实例太多的权限，不安全。

1. Buffer.alloc(size)
2. Buffer.allocUnsafe(size)
   这 2 个方法都是创建一个固定大小的 buffer 空间，不同的是，Buffer.allocUnsafe(size) 创建的 buffer 空间可能包含旧数据（使用了一些还未 gc 的碎片空间）。

3. Buffer.from(array)
   从已有数据创建一个 buffer 空间。
   参数类型有 3 种：

```
// 数字、字符串
const b1 = Buffer.from(1);
const b2 = Buffer.from("hello");

// 数组
const b3 = Buffer.from([1, 2, 3]);  // 注意，当使用数组作为参数时，尽量使用数字数组，使用字符串会导致结果不可预期

// buffer 实例
const b4 = Buffer.from(b3);   // b4与b3的内存大小一样，但是并不共用内存，修改b3，b4不会改变
```

### Buffer 的 split 方法

常用，但是没有原生实现

```
Buffer.prototype.split = function (sep) {
  let start = 0;
  let offset = 0;
  let len = Buffer.from(sep).length;    // 由于buffer里是字节长度，需要计算分隔符的长度
  let ret = [];

  while(offset = this.indexOf(sep, start) !== -1) {
    ret.push(this.slice(start, offset));
    start = offset + len;
  }
  ret.push(this.slice(start));
  return ret;
}

let bf = Buffer.from("hello world");
bf.split(" ");
```

## 12. Stream

### 优点

1. 时间效率：流的分段处理可以同时处理多个 chunk，无需等待前一步完整处理数据再进行下一步
2. 空间效率：同一时间流无需占用大数据内存
3. 方便扩展：流配合管道，扩展方便，只需关注当前段的输入输出

### 特点

1. 流有 4 种分类：Readable、Writable、Duplex、Transform，需要注意的是这些都是类(class)，但一般实际使用不会自己去实现这 4 种类的实例，因为常用的 io 方法比如 fs 和 http 内部已经继承 Stream，可以直接使用。
2. 流继承了 EventEmitter，所以流可以监听事件，比如 data、end、error 等
