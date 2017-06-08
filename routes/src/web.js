/**
 * Created by Home Laptop on 07-Jun-17.
 */
var express = require('express');
var router = express.Router();

var auth = require('./web/auth');

router.use('/login',require('./web/login'));
router.use('/signup',require('./web/signup'));

router.use('/', auth.auth, require('../index'));



module.exports = router;