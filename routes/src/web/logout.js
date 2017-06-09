var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/*',function (req, res) {
    if(!req.Token){
        res.redirect('/');
        return;
    }
    user.Logout(req.Token, function (err, Success) {
        memcached.del(req.Token,function (err) {
            if (err)    console.log(err);
            
            res.clearCookie(pubConfig.TokenTag);
            res.redirect('/');
        });
    })
});

module.exports = router;
