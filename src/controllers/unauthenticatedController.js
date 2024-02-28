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
    } else {
      // check password match
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        res.status(400).json({ message: 'Wrong password' });
      }

      // valid username and password
      // token is created using username only
      const token = jwt.sign({ username }, process.env.SECRET, { expiresIn: 60 * 60 * 24 }); // 1 day

      // return token for client to use for their subsequent requests
      res.status(200).json({
        message: 'Successfully login',
        token,
      });
    }
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

    // destruct to send back when needed
    const { fullname, username, password } = req.body;

    const user = {
      fullname,
      username,
    };

    // check existence of username
    if (checkExistedUsername !== null) {
      errors.push({
        msg: `Username is already existed.`,
        type: 'field',
        value: username,
        path: 'username',
        location: 'body',
      });
    }

    debug(`The error result is: `, errors);

    // data valid
    if (errors.length === 0) {
      const hashedPassword = await bcrypt.hash(password, Number(process.env.SECRET)); // encode password

      await new User({ ...user, hashedPassword, isCreator: false }).save();

      res.status(200).json({
        message: `Success created user`,
        user,
      });
    }

    // data invalid
    else {
      // errors to display, user to re-fill the form for them
      res.status(400).json({
        message: `Cannot create that user.`,
        errors,
        user,
      });
    }
  }),
];

module.exports.all_posts_get = asyncHandler(async (req, res, next) => {
  debug(`the req.user object: `, req.user);
  let posts;

  // creator, get all posts
  if (req.user && req.user?.isCreator) {
    posts = await Post.find({}).exec();
  }

  // viewer, get published posts
  else {
    posts = await Post.find({ published: true }).exec();
  }

  debug(posts);

  res.status(200).json({ posts });
});

module.exports.post_get = asyncHandler(async (req, res, next) => {
  debug(`The id belike: `, req.params.postid);
  let post;

  // creator can get unpublished posts
  if (req.user && req.user?.isCreator) {
    post = await Post.findOne({ _id: req.params.postid }).exec();
  }

  // only published posts
  else {
    post = await Post.findOne({ _id: req.params.postid, published: true }).exec();
  }

  // user is not creator and post is private or post not exists
  if (post === null) {
    res.status(404).json({
      message: `Post not found`,
    });
  }

  // valid
  else {
    debug(`the post belike: `, post);

    res.json({
      post,
      message: `Post found`,
    });
  }
});

module.exports.all_comments_get = asyncHandler(async (req, res, next) => {
  const [post, comments] = await Promise.all([Post.findById(req.params.postid).exec(), Comment.find({ post: req.params.postid }).exec()]);

  // post exists, post published or user is creator
  if (post !== null && (post.published || (req.user && req.user?.isCreator))) {
    res.json({
      post,
      comments,
      message: `Found all comments of ${post.title}`,
    });
  }

  // post not exists
  if (post === null) {
    res.status(404).json({ message: `Post not found` });
  }

  // user is not creator and try to access private post
  if (!post.published && (!req.user || !req.user?.isCreator)) {
    res.status(403).json({
      message: `Normal user cannot access private post`,
    });
  }

  // just in case
  else {
    res.status(404).json({
      message: `Not found`,
    });
  }
});
