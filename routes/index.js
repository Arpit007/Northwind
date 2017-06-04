var express = require('express');
var router = express.Router();
var jwt = require('./auth/jwt');
var statusCode = require('./base/statusCodes');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  
});

router.get('/reg', function(req, res, next) {
    if (req.query.Name && !req.query.Name.isEmpty) {
        var token = new jwt.Payload();
        token.auth = req.query.Name;
        res.writeHead(statusCode.Ok,{'Content-Type':'text/plain'});
        res.end(jwt.getToken(token));
    }
    else{
        res.writeHead(statusCode.BadRequest,{'Content-Type':'text/plain'});
        res.end('No Name Provided');
    }
});

module.exports = router;
