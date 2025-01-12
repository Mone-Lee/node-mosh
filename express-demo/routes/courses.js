const express = require('express');
const router = express.Router();

const courses = [
  { id: 1, name: 'course1' },
  { id: 2, name: 'course2' },
  { id: 3, name: 'course3' },
]

router.get('/api/courses', (req, res) => {
  res.send(courses)
})

// 路由参数
// 单个参数
router.get('/api/courses/:id', (req, res) => {
  // res.send(req.params.id)
  const course = courses.find(c => c.id === parseInt(req.params.id))
  if (!course) {
    res.status(404).send('The course with the given ID was not found')
    return;
  }
  res.send(course)
})
// // 多个参数
// router.get('/api/posts/:year/:month', (req, res) => {
//   res.send(req.params)
// })
// // 查询字符串 query
// app.get('/api/posts', (req, res) => {
//   res.send(req.query)
// })

router.post('/api/courses', (req, res) => {

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

router.put('/api/courses/:id', (req, res) => {
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

router.delete('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id))
  if (!course) {
    res.status(404).send('The course with the given ID was not found')
    return;
  }

  const index = courses.indexOf(course)
  courses.splice(index, 1)

  res.send(course)
})

module.exports = router;