/**
 * 引用查询
 * 
 * 通过 populate 方法，关联查询
 */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const Author = mongoose.model('Author', new mongoose.Schema({
  name: String,
  bio: String,
  website: String
}))

const Course = mongoose.model('Course', new mongoose.Schema({
  name: String,
  author: {
    /** 
     * 下面2句表示author是一个外键，指向Author这个model
     * 
     * 注意，虽然这里声明了指向，但是mongodb实际并不会做关联，也不会做校验，即使传入非法值也会保存成功
     */ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }
}))

async function createAuthor(name, bio, website) {
  const author = new Author({
    name,
    bio,
    website
  })

  const result = await author.save()
  console.log(result)
}

async function createCourse(name, author) {
  const course = new Course({
    name,
    author
  })

  const result = await course.save()
  console.log(result)
}

async function listCourses() {
  const result = await Course
    .find()
    /**
     * 通过 populate 方法，可以关联查询，这里表示查询 Course 的时候，把 author 也查询出来
     * 
     * {
     *    _id: new ObjectId('67860c081707f624e00447cb'),
     *    name: 'Node Course',
     *    author: {
     *      _id: new ObjectId('67860bed006c953b843459ca'),
     *      name: 'Camille',
     *      bio: 'My bio',
     *      website: 'My Website',
     *      __v: 0
     *    }
     *  }
     * 
     * 如果没有populate，那么 author 只是一个 ObjectId
     * 例：
     * {
     *    _id: new ObjectId('67860c081707f624e00447cb'),
     *    name: 'Node Course'
     * }
     * 
     */
    .populate('author')
    // 可以指定查询 author 的哪些字段, 前面加个“-”表示排除这个属性，例：要name，不要_id
    // .populate('author', 'name -_id')
    // 可以链式调用，同时关联更多的表，例：关联 author 和 category
    // .populate('category')
    .select('name')
  console.log(result)
}

// createAuthor('Camille', 'My bio', 'My Website')

// createCourse('Node Course', '67860bed006c953b843459ca')

listCourses()