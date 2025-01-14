/**
 * 嵌入查询
 */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


const AuthorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String
})

const Author = mongoose.model('Author', AuthorSchema)

const Course = mongoose.model('Course', new mongoose.Schema({
  name: String,
  /**
   * 通过嵌入式查询，把 author 的信息直接嵌入到 Course 中
   * 
   * 注意，传入的是AuthorSchema，而不是Author
   */ 
  author: AuthorSchema,
  // 或者增加校验
  // author: {
  //   type: AuthorSchema,    // AuthorSchema 相当于一个原始类型，String之类的
  //   required: true
  // }
}))

async function createCourse(name, author) {
  const course = new Course({
    name,
    author
  })

  const result = await course.save()
  console.log(result)
}


/**
 * 更新嵌入式文档的2种方法
 * 
 * 方法1：
 * 查找父文档，通过父文档的属性直接修改（course.author）。
 * 注意，保存时，使用的是父文档的 save 方法，而不是 author 的 save 方法
 * 
 * 方法2：
 * 使用 mongoose 的 update 方法，直接更新 author 的属性
 */
async function updateCourse(courseId) {
  // 方法1：
  const course = await Course.findById(courseId)
  course.author.name = 'Camille changed'
  // 注意不是course.author.save()
  course.save()

  // 方法2：
  // await Course.update({_id: courseId}, {
  //   $set: {
  //     // 注意这里的 author.name，多层嵌套使用.来访问
  //     'author.name': 'Camille changed'
  //   }
  // })
}


// 子文档为数组类型时，新增子文档
async function addCourse(courseId, author) {
  const course = await Course.findById(courseId);
  // 通过push更新数组
  course.authors.push(author);
  course.save();
}

// 子文档为数组类型时，删除子文档
async function removeCourse(courseId, authorId) {
  const course = await Course.findById(courseId);
  const author = course.authors.id(authorId);
  author.remove();
  course.save();
}

/**
 * 注意，这里不会先调用创建Author方法，而是在创建course的时候，直接把author的信息嵌入到course中
 */
createCourse('Node Course', new Author({
    name: 'Camille',
    bio: 'My bio',
    website: 'My Website'
  })
)
