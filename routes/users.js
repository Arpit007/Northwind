var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
    res.end('User ID: ' + req.UserId);
});

module.exports = router;
