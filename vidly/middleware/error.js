// 错误处理


// 注意比其他中间件多一个err参数
module.exports = function(err, req, res, next) {
  res.status(500).send('Something failed.');
}