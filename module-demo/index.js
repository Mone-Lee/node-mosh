const path = require('path');
const fs = require('fs');
const vm = require('vm');


function Module(id) {
  this.id = id;
  this.exports = {};
}

Module._resolveFilename = function (filename) {
  let absPath = path.resolve(__dirname, filename);

  if (fs.existsSync(absPath)) {
    return absPath;
  } else {
    // 尝试补足文件扩展名（.js、.json、 .node）
    let extensions = Object.keys(Module._extensions);
    for (let i = 0; i < extensions.length; i++) {
      let newFile = absPath + extensions[i];
      if (fs.existsSync(newFile)) {
        return newFile;
      }
    }
  }

  throw new Error(`${filename} is not exits`);
}

Module._extensions = {
  '.js': (module) => {
    // 1. 读取文件内容
    let content = fs.readFileSync(module.id, 'utf8');

    // 2. 包装函数
    content = Module.wrapper[0] + content + Module.wrapper[1];

    // 3. vm生成函数
    let compileFn = vm.runInContext(content);

    // 4. 构建参数
    let exports = module.exports;
    let filename = module.id;
    let dirname = path.dirname(module.id);

    // 5. 执行函数
    // 注意第一个参数exports修改了this的指向，所以我们在模块中打印this时，返回的是一个对象，而不是global
    compileFn.call(exports, exports, myRequire, module, filename, dirname);

  },
  '.json': (module) => {
    const content = JSON.parse(fs.readFileSync(module.id, 'utf8'));

    module.exports = content;
  },
}

Module._cache = {};

Module.wrapper = [
  '(function (exports, require, module, __filename, __dirname) {',
  '})'
];

Module.prototype.load = function () {
  let extname = path.extname(this.id);
  Module._extensions[extname](this);
}

// 定义一个函数，用于加载模块
function myRequire(filename) {
  // 1. 获取绝对路径
  let mPath = Module._resolveFilename(filename);
  
  // 2. 缓存优先
  let cacheModule = Module._cache[mPath];
  if (cacheModule) {
    return cacheModule.exports;
  }

  // 3. 创建空对象加载模块（每个模块其实是一个对象）
  let module = new Module(mPath);

  // 4. 缓存模块
  Module._cache[mPath] = module;

  // 5. 加载模块（编译执行）
  module.load();

  return module.exports;
}

let obj = myRequire('./v');
console.log(obj);

