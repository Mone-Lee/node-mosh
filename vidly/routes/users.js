const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const {User, validate} = require('../models/user');
const express = require('express');
const router = express.Router();

// 如何不通过传userid的方式获取用户信息（传userid的话，可能猜到其他用户的id,从而获取到别人的信息）
router.get('/me', auth, async (req, res) => {
  // 使用授权中间件auth中设置在req.user的信息
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
})

router.get('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(404).send('User already registered.');

  user = new User({ 
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  // const token = await jwt.sign({id: user._id}, 'jwtPrivateKey');
  /**
   * 注意： token不要存在数据库中。万一数据库被黑，token也会被盗，那么黑客就可以用token登录你的账号
   */
  const token = user.generateAuthToken();

  res.header('x-auth-token', token).send(user);
});


module.exports = router;