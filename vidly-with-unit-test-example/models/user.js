const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: Boolean
})


// 在模型中封装方法
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin },  'jwtPrivateKey');
  return token;
}

const User = mongoose.model('User', UserSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(50).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validate = validateUser;