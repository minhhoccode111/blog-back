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

// will be call jwt.sign() to create a object, and secret and option like algorithm and time expire
const jwt = require('jsonwebtoken');
const comment = require('./../models/comment');

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

    // not a creator
    if (!req.user.isCreator) {
      res.status(403).json({
        message: `User is not qualified to create post.`,
      });
    } else if (errors.length === 0) {
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
    if (!req.user.isCreator) {
      res.status(403).json({
        message: `User is not qualified to edit post.`,
      });
    } else if (errors.length === 0) {
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
  }
  // user not creator
  else if (!req.user.isCreator) {
    res.status(403).json({
      message: `User is not qualified to delete a post.`,
    });
  }
  // all valid
  else {
    await Post.findByIdAndDelete(req.params.postid);
    res.status(200).json({
      message: `Success deleted post: ${title}.`,
    });
  }
});

module.exports.all_comments_post = [
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array();
    const post = await Post.findById(req.params.postid).exec();

    const { content } = req.body;

    // not found or user is not qualified to post a comment on private post
    if (post === null || (!req.user.isCreator && !post.published)) {
      res.status(404).json({
        message: `Post not found`,
      });
    }

    // bad request data
    if (errors.length !== 0) {
      res.status(400).json({
        message: `Cannot create a comment with that data.`,
        content,
      });
    }

    // valid user authorization, data and post existed
    const comment = new Comment({
      content,
      post,
      creator: req.user,
    });
    await comment.save();
    res.status(200).json({
      message: `Success created comment.`,
      comment,
    });
  }),
];

module.exports.comment_put = [
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array();
    const { content } = req.body;

    // find comment to update
    if (!errors.length === 0) {
      res.status(400).json({
        message: `Cannot update comment with that data.`,
        content,
      });
    }
    // update data valid
    else {
      const [post, comment] = await Promise.all([Post.findById(req.params.postid).exec(), Comment.findById(req.params.commentid).exec()]);

      if (comment === null) {
        const err = new Error(`Comment not found`);
        err.status = 404;
        next(err);
      } else if (post === null || (!req.user.isCreator && !post.published)) {
        res.status(404).json({
          message: `Post not found`,
        });
      }
      // comment not belong to the post
      else if (post.id !== comment.post) {
        res.status(400).json({
          message: `Comment not belong to the post`,
        });
      }
      // all valid
      else {
        const comment = new Comment({
          content,
          post: comment.post,
          creator: comment.creator,
        });
        await Comment.findByIdAndUpdate(req.params.commentid, comment, {});

        res.status(200).json({
          message: `Success update comment in post.`,
          comment,
          post,
        });
      }
    }
  }),
];

module.exports.comment_delete = (req, res, next) => {
  res.json({ message: `not implemented: comment delete`, notice: 'logged in user can delete their own comment on a post, author can delete any comment of any post', postid: req.params.postid });
};
