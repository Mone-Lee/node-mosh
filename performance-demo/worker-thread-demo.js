const {Worker, workerData, isMainThread} = require('worker_threads');

if (isMainThread) {
  console.log('main thread started...');
  // 创建子线程，分别进行计算，避免阻塞主线程
  new Worker(__filename, {
    workerData: [7, 8, 3, 9]
  });
  new Worker(__filename, {
    workerData: [1, 7, 4, 7, 9]
  });
} else {
  console.log('worker thread started...');
  // 大数组的排序是一个耗时的操作，我们可以将这个操作放在子线程中进行
  const result = workerData.sort();  // 这里的workerData是通过new Worker传递过来的参数
  console.log(result);
}