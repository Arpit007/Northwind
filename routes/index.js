var express = require('express');
var router = express.Router();
var jwt = require('./auth/jwt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  
});
router.get('/reg', function(req, res, next) {
    var token = new jwt.Payload();
    token.auth = req.query.Name;
  res.end(jwt.getToken(token));
});

module.exports = router;
