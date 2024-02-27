// no need for try...catch block
const asyncHandler = require('express-async-handler');

// sanitize and validate data
const { body, validationResult } = require('express-validator');

// mongoose models
const User = require('./../models/user');
const Post = require('./../models/post');
const Comment = require('./../models/comment');

// debug
const debug = require('debug')('xxxxxxxxxxxxxxxxxxxx-debug-xxxxxxxxxxxxxxxxxxxx');

// bcrypt to secure password
const bcrypt = require('bcrypt');

// for login
const passport = require('passport');

// will be call jwt.sign() to create a object, and secret and option like algorithm and time expire
const jwt = require('jsonwebtoken');

module.exports.login_post = [
  (req, res, next) => {
    res.json({ message: `not implemented: login post`, notice: 'any one can post a login request' });
  },
  asyncHandler(async (req, res, next) => {
    // extract data from form
    const username = req.body.username;
    const password = req.body.password;
    // check valid login
    const user = await User.findOne({ username }).exec();
    const valid = await bcrypt.compare(password, user?.password);
    if (user === null || !valid) {
      res.status(401).json({ message: 'Wrong username or password' });
    } else {
      const token = jwt.sign({ username }, process.env.SECRET, { expiresIn: 3600 }); // 1 hours

      // return token for client to use for their subsequent requests
      res.status(200).json({
        message: 'Successfully login',
        token,
      });
    }
  }),
];

module.exports.signup_post = (req, res, next) => {
  res.json({ message: `not implemented: signup post`, notice: 'any one can post a signup request' });
};

module.exports.all_posts_get = (req, res, next) => {
  res.json({ message: `not implemented: all posts get`, notice: 'any one can get all posts' });
};

module.exports.post_get = (req, res, next) => {
  res.json({ message: `not implemented: post get`, notice: 'any one can get a post', postid: req.params.postid });
};

module.exports.all_comments_get = (req, res, next) => {
  res.json({ message: `not implemented: all comments get`, notice: `any one can get a post's all comments`, postid: req.params.postid });
};
