var express = require('express');
var router = express.Router();
var jwt = require('./src/core/jwt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: pubConfig.appName });
});

router.get('/xyz', function(req, res, next) {
    res.end('Hello');
});

module.exports = router;
