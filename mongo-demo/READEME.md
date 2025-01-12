## Mongodb

非关系型数据库，不需要像关系型数据库那样创建表，没有列之类的概念，直接插入数据即可。  
插入和读取的数据都是 json 形式。

### mac 安装 Mongodb

先安装 homebrew: https://brew.sh/，然后安装 mongodb：https://www.mongodb.com/zh-cn/docs/manual/tutorial/install-mongodb-on-os-x/

### mongodb 数据存储

默认 mongodb 的数据存储在 /data/db 目录下，安装后，需要手动创建这个文件夹。

```
mkdir -p /data/db
```

创建好文件夹后，需要配置文件夹的权限。

```
sudo chown -R `id run` /data/db
```

### 启动 mongodb

运行 `mongod` 来启动 Mongo damen。Mongo damen 是一个在后台运行的服务，用来监听给定端口的请求。默认端口是 27017。  
mongod 是 Mongo damen 的缩写。

```
mongod
```

### 连接 mongodb

项目中使用 mongoose 包 来连接 mongodb。mongoose 是一个用于连接 mongodb 的简单 API

```
npm i mongoose
```

### 管理 mongoDB 数据库

使用 mongodb compass: https://www.mongodb.com/try/download/shell

### mongoDB 数据库操作

#### 基本概念

connection: 连接，一个连接就是一个数据库服务，类似“表”。  
document: 文档，一个文档就是一个数据，类似“行”。

mongoose 使用 schema 来创建 mongod 的文档结构.  
注意：schema 是 mongoose 的概念，不是 mongodb 的概念。

schema 字段可用类型：

1. String：字符串类型
2. Number：数字类型
3. Date：日期类型
4. Buffer：二进制数据类型
5. Boolean：布尔类型
6. ObjectId：对象 ID 类型，通常用于引用其他文档
7. Array：数组类型，可以包含上述任何类型
8. Mixed：混合类型，可以包含任何类型的值
9. Map：键值对类型，键为字符串，值可以是任何类型
10. Decimal128：高精度数字类型
11. UUID：通用唯一标识符类型

例：

```
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  name: String,
  age: Number,
  birthday: Date,
  bio: Buffer,
  isActive: Boolean,
  parent: mongoose.Schema.Types.ObjectId,
  hobbies: [String],
  metadata: mongoose.Schema.Types.Mixed,
  tags: Map,
  balance: mongoose.Schema.Types.Decimal128,
  uuid: mongoose.Schema.Types.UUID
});

const Example = mongoose.model('Example', exampleSchema);

module.exports = Example;
```
