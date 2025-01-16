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

## 3. JWT

JSON Web Token  
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
