/**
 * 使用https
 */

const https = require('https');
const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

// dotenv包的作用：将.env文件中的环境变量注入到process.env中
require('dotenv').config();

const PORT = 3000;

// mock从google获取的client_id和client_secret，并将其存储在.env文件中
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
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

const app = express();

function checkLogin(req, res, next) {
  const isLogined = true;

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
    session: false
  }),
  (req, res) => {
    res.send('Google login success');
  }
)

app.get('/auth/logout', (req, res) => {})

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