/**
 * 使用https、oauth、session
 * 
 * 这一切都可以说是为了实现checkLogin中间件，保护重要的信息
 */

const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');  // 用于存储session（在cookie中）， 相对应存储在服务端的是express-session中间件

// dotenv包的作用：将.env文件中的环境变量注入到process.env中
require('dotenv').config();

const PORT = 3000;

// mock从google获取的client_id和client_secret，并将其存储在.env文件中
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  SESSION_KEY1: process.env.SESSION_KEY1,
  SESSION_KEY2: process.env.SESSION_KEY2
}

const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
}

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log('accessToken:', accessToken);
  console.log('refreshToken:', refreshToken);
  console.log('profile:', profile);

  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// 将服务器的数据序列化到session中，通过setCookie发送到客户端
// 这里的数据就是verifyCallback中的done传递的数据
passport.serializeUser((user, done) => {
  done(null, user.id);
})

// 从session中反序列化数据, 并赋值给req.user
passport.deserializeUser((id, done) => {
  done(null, id);
})

const app = express();
cookieSession({
  name: 'session',
  // session有效期 24 hours
  maxAge: 24 * 60 * 60 * 1000,
  // 用来加密和解密session的密钥，一般建议使用数组，可以设置多个密钥。默认使用第一个密钥加密解密，如果有多个密钥，会依次使用密钥解密，直到解密成功，这使得密钥可以轮换，而不会影响已经登录的用户
  keys: [config.SESSION_KEY1, config.SESSION_KEY2]    
});
app.use(passport.initialize());  // 设置passport的session
app.use(passport.session());    // 使用session，当收到请求时，调用deserializeUser方法，将session中的数据赋值给req.user

function checkLogin(req, res, next) {
  const isLogined = req.user && req.isAuthenticated(); // isAuthenticated()方法用于判断用户是否已经登录，由passport提供

  if (!isLogined) {
    res.status(401).send('Not authorized');
  }

  next();
}

app.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true    // 通过设置session为true, passport会将用户信息存储在session中，并调用serializeUser方法
  }),
  (req, res) => {
    res.send('Google login success');
  }
)

app.get('/auth/logout', (req, res) => {
  req.logout();  // 通过调用logout方法(由passport提供)，清除session中的数据和req.user
  res.redirect('/');
})

app.get('/secret', checkLogin, (req, res) => {
  return res.send('The secret code is 11');
})

app.get('/failure', (req, res) => {
  return res.send('Google login failed');
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
})