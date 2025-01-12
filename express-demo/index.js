const morgan = require('morgan');
const Joi = require('joi');
const root = require('./routes/root');
const courses = require('./routes/courses');
const express = require('express');
const app = express();

/**
 * 运行环境
 */
// 获取运行环境的2种方式：
// 1. process.env.NODE_ENV，如果没设置，则为undefined
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
// 2. app.get('env')， 内部调用了process.env.NODE_ENV，但会给默认值development
console.log(`app.get('env'): ${app.get('env')}`)

if (app.get('env') === 'development') {
  app.use(morgan('tiny'))
  console.log('Morgan enabled...')
}


/**
 * 中间件（中间函数）
 * 本质是一个函数，接收3个参数： req-请求对象、res-响应对象、next-next函数
 * 
 * 作用：对请求和响应进行预处理,每一个请求都会按中间件use的顺序执行
 * 
 * 注意：app.route()的回调函数也是中间件，比如app.get('/', (req, res) => {res.send('Hello World!!!!')})
 * 
 * 运行: 中间件可以通过next()方法调用下一个中间件，或者通过res.send()结束请求。如果都没有，则请求会一直挂起在当前中间件。
 */

// 内置中间件
// express.json() 用于解析请求体中的json数据，然后把解析后的数据挂载到req.body上
app.use(express.json())
// express.urlencoded() 用于解析请求体中的urlencoded数据(用于表单， 格式key=value&key=value)，然后把解析后的数据挂载到req.body上
app.use(express.urlencoded({ extended: true }))
// express.static() 用于提供静态文件服务，比如图片、css、js等。使得可以通过url访问到public目录下的文件，例：http://localhost:3000/readme.txt
app.use(express.static('public'))

app.use(function (req, res, next) {
  console.log('log')
  next()
})

app.use(function (req, res, next) {
  console.log('authorize')
  next()
  console.log('after authorize')
})



/**
 * 表示所有以 /api/courses 开头的请求都会交给courses路由处理
 * courses.js中的路由都是以 /api/courses 开头的，url可以省略 /api/courses
 */
app.use('/api/courses', courses)
app.use('/', root)  



// 环境变量
// 在生产环境运行应用时，本应用分配到的端口是随机的，不能写死3000，应使用环境变量
// 环境变量是独立于应用代码的，可以在代码之外修改，比如在服务器上修改
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Example app listening on port 3000!')
})