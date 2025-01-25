const express = require('express');
const cluster = require('cluster');
const os = require('os');

const app = express();

function blocking(duration) {
  const start = new Date().getTime();

  while (new Date().getTime() - start < duration) {
    // blocking
  }
}

app.get('/', (req, res) => {
  res.send('performance demo');
})

app.get('/timer', (req, res) => {
  blocking(9000);
  // 通过process.pid可以获取当前进程的pid
  res.send(`timer ${process.pid}`);
})


// 子进程创建后，实际执行的也是这个文件的代码，所以我们可以看到下面这行代码被执行3次
console.log('process is working...');

// 通过isMaster判断当前进程是否是主进程
if (cluster.isMaster) {
  console.log('master process started...');
  // 创建子进程
  // cluster.fork();
  // cluster.fork();
  const cpuNums = os.cpus().length;
  for (let i = 0; i < cpuNums; i++) {
    cluster.fork();
  }
} else {
  console.log(`worker process started...`);
  // 注意：这里的app.listen不能放在if (cluster.isMaster) {} 里面
  app.listen(3000);
}

