'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var auth_middleware = require('../middlewares/authenticated');
var mulitpart = require('connect-multiparty');
var upload_middleware = mulitpart({ uploadDir: './uploads/users' });

var router = express.Router();

router.post('/save', UserController.save);
router.post('/login', UserController.login);
router.put('/update', auth_middleware.auth, UserController.update);
router.post('/upload-avatar', [auth_middleware.auth, upload_middleware], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.getAvatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

module.exports = router;