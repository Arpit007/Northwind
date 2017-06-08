/**
 * Created by Home Laptop on 03-Jun-17.
 */
var express = require('express');
var router = express.Router();

var user = require('../../model/user');

function Gateway(req, res, next) {
    var Token = readToken(req, pubConfig.TokenTag);
    
    if (Token) {
        user.Authenticate(Token,function (err, ID) {
            if (err){
                delete req.cookies[pubConfig.TokenTag];
                delete req.headers[pubConfig.TokenTag];
                req.UserId = null;
            }
            else {
                req.UserId = ID.toString();
                req.Token = Token;
            }
            next();
        });
    }
    else {
        req.UserId = null;
        next();
    }
}

function readToken(req, name) {
    if (req.headers[name]){
        return req.headers[name];
    }
    else if (req.cookies[name]) {
        return req.cookies[ name ];
    }
    else if (req.query[name]) {
        return req.query[ name ];
    }
    else if (req.body[name]) {
        return req.body[ name ];
    }
    return null;
}

router.use(Gateway);

module.exports = router;