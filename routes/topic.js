'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');
var auth_middleware = require('../middlewares/authenticated');
var router = express.Router();

router.post('/topic', auth_middleware.auth, TopicController.save);

module.exports = router;

