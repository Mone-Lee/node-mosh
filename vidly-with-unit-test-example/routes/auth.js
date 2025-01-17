const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  /**
   * jwt分为三部分：header.payload.signature
   * 
   * header 是标准化的内容，可以忽略
   * 
   * payload 可以存放一些自定义的信息，比如用户的id，这样服务器获取token后，解析token即可获取信息，不用查找数据库
   * 
   * signature 是对payload和秘钥（存放在服务器， 如下面的'jwtPrivateKey'）进行加密后的结果，用于验证token是否被篡改
   * 
   * 秘钥需要用环境变量存储，不要明文放在代码中
   * 
   * 所以生成token需要自定义的有payload和秘钥
   */
  const token = await jwt.sign({id: user._id}, 'jwtPrivateKey');
  res.send(token);
});

const validate = () => {
  const schema = {
    email: Joi.string().min(3).max(50).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
}
 

module.exports = router;