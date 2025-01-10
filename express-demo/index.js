const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json())

const courses = [
  { id: 1, name: 'course1' },
  { id: 2, name: 'course2' },
  { id: 3, name: 'course3' },
]

app.get('/', (req, res) => {
  res.send('Hello World!!!!')
})

app.get('/api/courses', (req, res) => {
  res.send(courses)
})

// 路由参数
// 单个参数
app.get('/api/courses/:id', (req, res) => {
  // res.send(req.params.id)
  const course = courses.find(c => c.id === parseInt(req.params.id))
  if (!course) {
    res.status(404).send('The course with the given ID was not found')
    return;
  }
  res.send(course)
})
// 多个参数
app.get('/api/posts/:year/:month', (req, res) => {
  res.send(req.params)
})
// 查询字符串 query
app.get('/api/posts', (req, res) => {
  res.send(req.query)
})

app.post('/api/courses', (req, res) => {

  // 验证
  // if (!req.body.name || req.body.name.length < 3) {
  //   res.status(400).send('Name is required and should be minimum 3 characters')
  //   return;
  // }

  const schema = {
    name: Joi.string().min(3).required()
  }
  const result = Joi.validate(req.body, schema)
  if (result.error) {
    res.status(400).send(result.error.details[0].message)
    return;
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name
  }
  courses.push(course)
  res.send(course)
})

app.put('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id))
  if (!course) {
    res.status(404).send('The course with the given ID was not found')
    return;
  }

  const schema = {
    name: Joi.string().min(3).required()
  }
  const result = Joi.validate(req.body, schema)
  if (result.error) {
    res.status(400).send(result.error.details[0].message)
    return;
  }

  course.name = req.body.name
  res.send(course)
})

app.delete('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id))
  if (!course) {
    res.status(404).send('The course with the given ID was not found')
    return;
  }

  const index = courses.indexOf(course)
  courses.splice(index, 1)

  res.send(course)
})


// 环境变量
// 在生产环境运行应用时，本应用分配到的端口是随机的，不能写死3000，应使用环境变量
// 环境变量是独立于应用代码的，可以在代码之外修改，比如在服务器上修改
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Example app listening on port 3000!')
})