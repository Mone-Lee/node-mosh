const mongoose = require('mongoose');

/**
 * 连接数据库
 * localhost: 表示本地数据库，实际开发中，应使用环境变量来配置数据库地址
 * playground: 数据库名称，如果不存在，则会在第一次往数据库写数据时自动创建
 * 
 * connect()返回一个promise对象
 */
mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


// shema
const courseSchema = new mongoose.Schema({
  name: String,
  author: String,
  tags: [String],
  date: { type: Date, default: Date.now },  // 通过default设置默认值
  isPublished: Boolean
})

// 通过model，将schema转成一个类。 通过model，将schema与collection关联，从而操作mongoDB
const Course = mongoose.model('Course', courseSchema);  // 其中参数Course是connection（类似表）的单数形式


// 创建数据
async function createCourse() {
  // 初始化一个Course的对象, 对应document（类似行）
  const course = new Course({
    name: 'React Course',
    author: 'Camille',
    tags: ['react', 'frontend'],
    isPublished: true
  })

  // 将document保存到数据库，保存时异步操作
  const result = await course.save();
  console.log(result);
}

// createCourse();


// 查询数据
async function getCourses() {
  const result = await Course
    .find({ author: 'Camille', isPublished: true })  // 查询条件,无则全选
    /**
     * 比较操作符:
     * eq (equal)
     * ne (not equal)
     * gt (greater than)
     * gte (greater than or equal to)
     * lt (less than)
     * lte (less than or equal to)
     * in
     * nin (not in)
     */
    // .find({ price: {$gt: 10, $lte: 20} }) // 价格大于10，小于等于20
    // .find({ price: {$in, [10, 20, 30]} }) // 价格等于10，20，30中的一个
    /**
     * 逻辑操作符:
     * or
     * and
     */
    // .find().and([{ author: 'Camille' }, { isPublished: true }])  // 作者是Camille且已发布，等价于上面的写法
    .limit(10)  // 限制返回结果数量
    .sort({ name: 1 })  // 排序，1表示升序，-1表示降序
    .select({ name: 1, tags: 1 })  // 选择返回字段，1表示返回，0表示不返回
  
  console.log(result);
}

// getCourses();


// 更新数据
async function updateCourse(id) {
  const course = await Course.findById(id);
  if (!course) return;

  course.isPublished = true;
  course.author = 'Another Author';

  // course.set({
  //   isPublished: true, 
  //   author: 'Another Author'
  // })

  const result = await course.save();
  console.log(result);
}

// 直接使用Course的方法（update、findByIdAndUpdate等）来更新
async function updateCourse2(id) {
  const result = await Course.update({ _id: id }, {
    // 更新操作符：https://www.mongodb.com/zh-cn/docs/manual/reference/operator/update/
    $set: {
      author: 'Another Author',
      isPublished: true
    }
  })
  console.log(result);
}

// updateCourse('67837b8b647f820fbba6557c');


// 删除数据
async function removeCourse(id) {
  // deleteOne 找到第一个匹配的文档并删除
  const result = await Course.deleteOne({ _id: id })
  // deleteMany 找到所有匹配的文档并删除
  // const result = await Course.deleteMany({ author: 'Another Author' })
  // findByIdAndRemove 找到第一个匹配的文档并删除, 如果没找到，返回null
  // const result = await Course.findByIdAndRemove(id)
  console.log(result);
}

removeCourse('67837b8b647f820fbba6557c');
