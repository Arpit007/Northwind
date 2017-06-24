'use strict';

var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/*',function (req, res) {
    if(!req.Token){
        if (req.query.redirect)
            res.redirect(req.query.redirect);
        else res.redirect('/');
        return;
    }
    user.Logout(req.Token, function (err, Success) {
        memCached.del(req.Token,function (err) {
            if (err)
                console.log(err);
            res.clearCookie(pubConfig.TokenTag);
            if (req.query.redirect)
                res.redirect(req.query.redirect);
            else res.redirect('/');
        });
    })
});

module.exports = router;
