const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));


/**
 * shema
 * 
 * 注意schema是mongoose的东西，不是mongodb的，这里的校验都是mongoose做的,mongodb不做校验
 * 这是mongodb不同于mysql等的地方，mongodb不会进行数据库级别的校验
 * 
 */ 
const courseSchema = new mongoose.Schema({
  name: {type: String, required: true},  // 通过required设置必填字段
  // 字符类型的内建校验
  category: {
    type: String,
    // 注意与Number类型的min和max不同
    minlength: 5,
    maxlength: 255,
    // match: /pattern/  // 也可使用正则校验
    // enum: ['web', 'mobile', 'network']  // 枚举校验, 只能是这三个值中的一个
  },
  price: {
    type: Number,
    min: 10,
    max: 200,
    // required 除了是boolean值外，还可以是一个函数。 注意不要用箭头函数，因为箭头函数会改变this的指向
    required: function() { return this.isPublished; }  
  },
  author: String,
  // 自定义校验
  tags: {
    type: Array,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      // 校验不通过时的错误信息
      message: 'A course should have at least one tag'
    }
  },
  /**
   * 自定义异步校验
   * 
   * 使用isAsync: true来标识这是一个异步校验
   * 
   * validator接收参数callback，callback接收一个boolean值，表示校验是否通过
   */ 
  tags: {
    type: Array,
    isAsync: true,
    validate: {
      validator: function(v, callback) {
        setTimeout(() => {
          const result = v && v.length > 0;
          callback(result);
        }, 4000)
      }
    }
  },
  date: { type: Date, default: Date.now },  // 通过default设置默认值
  isPublished: Boolean,
})

const Course = mongoose.model('Course', courseSchema);


// 创建数据
async function createCourse() {
  const course = new Course({
    // name: 'React Course',
    author: 'Camille',
    tags: ['react', 'frontend'],
    isPublished: true
  })

  try {
    const result = await course.save();
    console.log(result);
  } catch (err) {
    // console.log(err.message)
    /**
     * 当有多个字段都错误时，可通过err.errors来获取所有错误
     * 
     * 比如name和category都错误时，可分别通过err.errors.name和err.errors.category来获取各字段对应的错误信息
     */
    for (field in err.errors) {
      console.log(err.errors[field].message);
    }
  }
}

createCourse();


// 查询数据
async function getCourses() {
  const result = await Course
    .find({ author: 'Camille', isPublished: true })
    .limit(10)
    .sort({ name: 1 })
    .select({ name: 1, tags: 1 })
  
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
  const result = await Course.deleteOne({ _id: id })
  console.log(result);
}

// removeCourse('67837b8b647f820fbba6557c');
