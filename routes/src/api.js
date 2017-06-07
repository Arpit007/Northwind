/**
 * Created by Home Laptop on 07-Jun-17.
 */
var express = require('express');
var router = express.Router();

var auth = require('./api/auth');

router.use('/login',require('./api/login'));
router.use('/signup',require('./api/signup'));
router.use('/logout',require('./api/logout'));

module.exports = router;