const express = require('express');
const router = express.Router();

const IndexController = require('../controllers/indexController');

router.post('/auth/login', IndexController.login_post);

router.post('/auth/signup', IndexController.signup_post);

router.get('/posts', IndexController.all_posts_get);

router.post('/posts', passport.authenticate({}), IndexController.all_posts_post);

router.get('/posts/:postid', IndexController.post_get);

router.put('/posts/:postid', IndexController.post_put);

router.delete('/posts/:postid', IndexController.post_delete);

router.get('/posts/:postid/comments', IndexController.all_comments_get);

router.post('/posts/:postid/comments', IndexController.all_comments_post);

router.put('/posts/:postid/comments/:commentid', IndexController.comment_put);

router.delete('/posts/:postid/comments', IndexController.comment_delete);

module.exports = router;
