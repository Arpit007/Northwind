'use strict';

var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/*',function (req, res) {
    var Token = req.Token;
    if(!Token){
        handleError(ErrorCode.InvalidRequest, res);
        return;
    }
    user.Logout(Token, function (err, Success) {
        if (err !== ErrorCode.InvalidRequest){
            handleError(err,res);
            return;
        }
    
        memCached.del(req.Token,function (err) {
            if (err)
                console.log(err);
            
            res.clearCookie(pubConfig.TokenTag);
            if (req.query.redirect)
                res.redirect(req.query.redirect);
            else
                res.json({Code : statusCodes.Ok , Message : 'Success'});
        });
    })
});

function handleError(err, res) {
    if (err === ErrorCode.InvalidRequest){
        res.json({ Code : statusCodes.BadRequest, Message : 'Invalid Request' });
    }
    else {
        res.json({ Code : statusCodes.BadRequest, Message : 'Internal Error' });
    }
}

module.exports = router;
