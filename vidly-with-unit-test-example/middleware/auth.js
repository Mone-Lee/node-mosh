const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    // jwt.verify() 方法验证 token 并返回解码后的对象，即payload
    const decode = jwt.verify(token, 'jwtPrivateKey');
    req.user = decode;
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}