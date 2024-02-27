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

module.exports.all_posts_post = (req, res, next) => {
  res.json({
    message: `not implemented: all posts post`,
    notice: 'only author can create a new post',
  });
};

module.exports.post_put = (req, res, next) => {
  res.json({ message: `not implemented: post put`, notice: 'only author can update a post', postid: req.params.postid });
};

module.exports.post_delete = (req, res, next) => {
  res.json({ message: `not implemented: post delete`, notice: 'only author can delete a post', postid: req.params.postid });
};

module.exports.all_comments_post = (req, res, next) => {
  res.json({ message: `not implemented: all comments post`, notice: 'logged in user can create new comment on a post', postid: req.params.postid });
};

module.exports.comment_put = (req, res, next) => {
  res.json({ message: `not implemented: comment put`, notice: 'logged in user can edit their own comment on a post', postid: req.params.postid });
};

module.exports.comment_delete = (req, res, next) => {
  res.json({ message: `not implemented: comment delete`, notice: 'logged in user can delete their own comment on a post, author can delete any comment of any post', postid: req.params.postid });
};
