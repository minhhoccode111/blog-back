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
    res.json({ message: `not implemented: login post` });
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
  res.json({ message: `not implemented: signup post` });
};

module.exports.all_posts_get = (req, res, next) => {
  res.json({ message: `not implemented: all posts get` });
};

module.exports.all_posts_post = (req, res, next) => {
  res.json({ message: `not implemented: all posts post` });
};

module.exports.post_get = (req, res, next) => {
  res.json({ message: `not implemented: post get` });
};

module.exports.post_put = (req, res, next) => {
  res.json({ message: `not implemented: post put` });
};

module.exports.post_delete = (req, res, next) => {
  res.json({ message: `not implemented: post delete` });
};

module.exports.all_comments_get = (req, res, next) => {
  res.json({ message: `not implemented: all comments get` });
};

module.exports.all_comments_post = (req, res, next) => {
  res.json({ message: `not implemented: all comments post` });
};

module.exports.comment_put = (req, res, next) => {
  res.json({ message: `not implemented: comment put` });
};

module.exports.comment_delete = (req, res, next) => {
  res.json({ message: `not implemented: comment delete` });
};

module.exports.signup_post = [
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage(`Full name can't not be empty!`)
    .custom((value) => /^[a-zA-Z0-9\s]+$/gi.test(value))
    .withMessage(`Full name must be alphanumeric`)
    .escape(),
  body('username').trim().isLength({ min: 8 }).withMessage(`Username must be least 8 characters`).isEmail().withMessage(`That's not an email address.`).escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage(`Password contain all spaces?`)
    .isLength({ min: 8, max: 32 })
    .withMessage(`Password must be between 8 and 32 characters!`)
    .isStrongPassword()
    .withMessage(`That's password is too weak. Please use at least 1 uppercase, 1 lowercase, 1 number, 1 special character!`)
    .escape(),
  body('password-confirm', `Confirm password does not match!`)
    .custom((value, { req }) => value === req.body.password)
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array();

    const checkExisted = await User.findOne({ username: req.body.username }, 'username').exec();

    // check existence of username
    if (checkExisted !== null) {
      errors.push({ msg: `That username is already existed!` });
    }

    debug(`the error result is: `, errors);

    const user = new User({
      admin: false,
      member: false,
      password: req.body.password, // need update if store in db
      fullname: req.body.fullname,
      username: req.body.username,
    });

    if (errors.length === 0) {
      const password = await bcrypt.hash(req.body.password, 10);
      user.password = password;
      await user.save();
      res.redirect('/login');
    } else {
      user['password-confirm'] = req.body['password-confirm'];
      res.render('signup-form', {
        title: 'Signup',
        user,
        errors,
      });
    }
  }),
];
