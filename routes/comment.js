'use strict'

var express = require('express');
var CommentController = require('../controllers/comment');
var auth_middleware = require('../middlewares/authenticated');
var router = express.Router();

router.post('/comment/topic/:topicId', auth_middleware.auth, CommentController.add);
router.put('/comment/:commentId', auth_middleware.auth, CommentController.update);
router.delete('/comment/:topicId/:commentid', auth_middleware.auth, CommentController.delete);

module.exports = router;