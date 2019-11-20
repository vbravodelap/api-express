'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');
var auth_middleware = require('../middlewares/authenticated');
var router = express.Router();

router.post('/topic', auth_middleware.auth, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user?', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id', auth_middleware.auth, TopicController.update);
router.delete('/topic/:id', auth_middleware.auth, TopicController.delete);
router.get('/search/:search', TopicController.search);

module.exports = router;

