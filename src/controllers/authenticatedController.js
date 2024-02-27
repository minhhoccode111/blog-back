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

module.exports.all_posts_post = [
  body(`title`, `Title cannot be empty.`).trim().notEmpty().escape(),
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  body(`published`, `Published cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array();

    // destruct data from body
    const { title, content, published } = req.body;

    const post = new Post({
      title,
      content,
      published,
    });

    if (errors.length === 0) {
      await post.save();
      res.status(200).json({
        post,
        message: `Success created post.`,
      });
    } else {
      res.status(400).json({
        post,
        errors,
        message: `Cannot create a post with that data.`,
      });
    }
  }),
];

module.exports.post_put = [
  body(`title`, `Title cannot be empty.`).trim().notEmpty().escape(),
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  body(`published`, `Published cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array();

    // destruct data from body
    const { title, content, published } = req.body;

    const post = new Post({
      title,
      content,
      published,
      _id: req.params.postid,
    });

    if (errors.length === 0) {
      const updatedPost = await Post.findByIdAndUpdate(req.params.postid, post, {});

      res.status(200).json({
        post: updatedPost,
        message: `Success created post.`,
      });
    } else {
      res.status(400).json({
        post,
        errors,
        message: `Cannot update a post with that data.`,
      });
    }
  }),
];

module.exports.post_delete = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postid).exec();
  const { title } = post;

  if (post === null) {
    const err = new Error(`Post not found.`);
    err.status = 404;
    next(err);
  } else {
    await Post.findByIdAndDelete(req.params.postid);
    res.status(200).json({
      message: `Success deleted post: ${title}.`,
    });
  }
});

module.exports.all_comments_post = (req, res, next) => {
  res.json({ message: `not implemented: all comments post`, notice: 'logged in user can create new comment on a post', postid: req.params.postid });
};

module.exports.comment_put = (req, res, next) => {
  res.json({ message: `not implemented: comment put`, notice: 'logged in user can edit their own comment on a post', postid: req.params.postid });
};

module.exports.comment_delete = (req, res, next) => {
  res.json({ message: `not implemented: comment delete`, notice: 'logged in user can delete their own comment on a post, author can delete any comment of any post', postid: req.params.postid });
};
