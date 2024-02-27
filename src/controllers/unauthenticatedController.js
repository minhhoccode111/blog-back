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

// will be call jwt.sign() to create a object, and secret and option like algorithm and time expire
const jwt = require('jsonwebtoken');

module.exports.login_post = [
  body('username').trim().escape(),
  body('password').trim().escape(),
  asyncHandler(async (req, res, next) => {
    // extract data from form
    const username = req.body.username;
    const password = req.body.password;
    // check username existed
    const user = await User.findOne({ username }).exec();
    if (user === null) {
      res.status(400).json({ message: 'Wrong username' });
    }

    // check password match
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(400).json({ message: 'Wrong password' });
    }

    // valid username and password
    // token is created using username only
    const token = jwt.sign({ username }, process.env.SECRET, { expiresIn: 60 * 60 }); // 1 hours

    // return token for client to use for their subsequent requests
    res.status(200).json({
      message: 'Successfully login',
      token,
    });
  }),
];

module.exports.signup_post = [
  body('fullname').trim().notEmpty().withMessage(`Fullname cannot be empty.`).isLength({ max: 50 }).withMessage(`Fullname length cannot pass 50 characters.`).escape(),
  body('username').trim().isLength({ min: 8 }).withMessage(`Username must be at least 8 characters.`).isEmail().withMessage(`Username must be a valid email address.`).escape(),
  body('password')
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage(`Password must be between 8 and 32 characters.`)
    .isStrongPassword()
    .withMessage(`Password must contain at least: 1 uppercase, 1 lowercase, 1 number, 1 special character.`)
    .escape(),
  body('confirm-password', `Confirm password does not match.`).custom((value, { req }) => req.body.password === value),

  asyncHandler(async (req, res, next) => {
    let errors = validationResult(req).array();

    const checkExistedUsername = await User.findOne({ username: req.body.username }, 'username').exec();

    // check existence of username
    if (checkExistedUsername !== null) {
      errors.push({ msg: `Username is already existed.` });
    }

    errors = errors.map((e) => ({ msg: e.msg }));

    debug(`The error result is: `, errors);

    // only send back fullname and username
    const { fullname, username } = req.body;

    const user = new User({
      fullname,
      username,
      isCreator: false,
    });

    // valid signup
    if (errors.length === 0) {
      // encode password
      const password = await bcrypt.hash(req.body.password, Number(process.env.SECRET));
      user.password = password;
      await user.save();

      res.status(200).json({ message: `Success`, user: { fullname, username } }); // user to fill in the login form for them
    }
    // invalid signup
    else {
      res.status(400).json({ message: `Cannot create that user.`, errors, user: { fullname, username } }); // errors to display, user to re-fill the form for them
    }
  }),
];

module.exports.all_posts_get = (req, res, next) => {
  res.json({ message: `not implemented: all posts get`, notice: 'any one can get all posts' });
};

module.exports.post_get = (req, res, next) => {
  res.json({ message: `not implemented: post get`, notice: 'any one can get a post', postid: req.params.postid });
};

module.exports.all_comments_get = (req, res, next) => {
  res.json({ message: `not implemented: all comments get`, notice: `any one can get a post's all comments`, postid: req.params.postid });
};
