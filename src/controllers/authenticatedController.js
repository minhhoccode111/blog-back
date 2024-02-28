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
  asyncHandler(async (req, res) => {
    const errors = validationResult(req).array();

    // destruct data from body
    const { title, content, published } = req.body;

    const post = new Post({
      title,
      content,
      published,
    });

    debug(`the post in post post belike: `, post);
    debug(`the user in post post belike: `, req.user);

    // data valid, user is creator
    if (errors.length === 0 && req.user.isCreator) {
      await post.save();
      res.status(200).json({
        post,
        message: `Success created post.`,
      });
    }

    // user is not creator
    if (!req.user.isCreator) {
      res.status(403).json({
        message: `User is not qualified to create post.`,
      });
    }

    // data invalid
    else if (errors.length === 0) {
      res.status(400).json({
        post,
        errors,
        message: `Cannot create a post with that data.`,
      });
    }

    // just in case
    else {
      res.status(404).json({
        message: `Not found`,
      });
    }
  }),
];

module.exports.post_put = [
  body(`title`, `Title cannot be empty.`).trim().notEmpty().escape(),
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  body(`published`, `Published cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req).array();

    // destruct data from body // TODO modify and test published form field (radio)
    const { title, content, published } = req.body;

    const post = new Post({
      title,
      content,
      published,
      _id: req.params.postid,
    });

    // data valid, user is creator
    if (errors.length === 0 && req.user.isCreator) {
      const updatedPost = await Post.findByIdAndUpdate(req.params.postid, post, {});

      res.status(200).json({
        post: updatedPost,
        message: `Success created post.`,
      });
    }

    // user is not creator
    if (!req.user.isCreator) {
      res.status(403).json({
        message: `User is not qualified to edit post.`,
      });
    }

    // data invalid
    if (errors.length !== 0) {
      res.status(400).json({
        post,
        errors,
        message: `Cannot update a post with that data.`,
      });
    }

    // just in case
    else {
      res.status(404).json({ message: `Not found` });
    }
  }),
];

module.exports.post_delete = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postid).exec();
  const { title } = post;

  // post not null and user is creator
  if (post !== null && req.user.isCreator) {
    await Post.findByIdAndDelete(req.params.postid);
    res.status(200).json({
      message: `Success deleted post: ${title}.`,
    });
  }

  // post not exists
  if (post === null) {
    res.status(404).json({
      message: `Post not found`,
    });
  }

  // user not a creator
  if (!req.user.isCreator) {
    res.status(403).json({
      message: `Post not found`,
    });
  }

  // just in case
  else {
    res.status(404).json({
      message: `Not found`,
    });
  }
});

module.exports.all_comments_post = [
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req).array();
    const post = await Post.findById(req.params.postid).exec();

    const { content } = req.body;

    // post not null, data valid, user is creator or post is published
    if (post !== null && errors.length === 0 && (req.user.isCreator || post.published)) {
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
    }

    // not found or user is not qualified to post a comment on private post
    if (post === null) {
      res.status(404).json({
        message: `Not found`,
      });
    }

    // user not qualified to comment on private post
    if (!req.user.isCreator && !post.published) {
      res.status(403).json({
        message: `Normal user cannot comment private post`,
      });
    }

    // bad request data
    if (errors.length !== 0) {
      res.status(400).json({
        message: `Cannot create a comment with that data.`,
        content,
      });
    }

    // just in case
    else {
      res.status(404).json({
        message: `Not found`,
      });
    }
  }),
];

module.exports.comment_put = [
  body(`content`, `Content cannot be empty.`).trim().notEmpty().escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req).array();
    const [post, comment] = await Promise.all([Post.findById(req.params.postid).exec(), Comment.findById(req.params.commentid).exec()]);
    const { content } = req.body;

    debug(`the errors in comment put belike: `, errors);
    debug(`the post in comment put belike: `, post);
    debug(`the comment in comment put belike: `, comment);
    debug(`the user in comment put belike: `, req.user);

    // valid, no errors, post exists, comments exists, comment belong to post, comment belong to user, user is creator or post is published
    if (errors.length === 0 && post !== null && comment !== null && comment.post === post.id && comment.creator === req.user.id && (req.user.isCreator || post.published)) {
      const comment = new Comment({
        content,
        post: comment.post,
        creator: comment.creator,
      });

      await Comment.findByIdAndUpdate(req.params.commentid, comment, {});

      res.status(200).json({
        message: `Success updated comment in post.`,
        comment,
        post,
      });
    }

    // post not exists
    if (post === null) {
      res.status(404).json({
        message: `Post not found`,
      });
    }

    // user is not creator and post is not published
    if (!req.user.isCreator && !post.published) {
      res.status(403).json({
        message: `Normal user cannot update private post`,
      });
    }

    // comment no exists
    if (comment === null) {
      res.status(404).json({
        message: `Comment not found`,
      });
    }

    // comment not belong to this post
    if (comment.post !== post.id) {
      res.status(400).json({
        message: `Comment not belong to the post`,
      });
    }

    // comment not belong to this user
    if (comment.user !== req.user.id) {
      res.status(401).json({
        message: `Comment not belong to the user`,
      });
    }

    // data invalid
    if (!errors.length === 0) {
      res.status(400).json({
        message: `Cannot update comment with that data.`,
        content,
      });
    }

    // just in case
    else {
      res.status(404).json({
        message: `Not found`,
      });
    }
  }),
];

module.exports.comment_delete = (req, res) => {
  res.json({ message: `not implemented: comment delete`, notice: 'logged in user can delete their own comment on a post, author can delete any comment of any post', postid: req.params.postid });
};
