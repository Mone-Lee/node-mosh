const {User} = require('../../../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('user.generateAuthToken', () => {
  // 检测依据，生成的token的payload是否和传入的参数一致
  it('should return a valid JWT token', () => {
    // 注意： 这里的_id不能是简单的字符串或者只是mongoose.Types.ObjectId()，因为在mongoose中_id是一个对象，内部做了一些转换，需要转换成字符串
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true
    };
    const user = new User(payload);
    const token = user.generateAuthToken();

    // 测试token
    // 实际开发中，要注意环境变量的获取
    const decoded = jwt.verify(token, 'jwtPrivateKey');
    expect(decoded).toMatchObject(payload);
  })
  
})