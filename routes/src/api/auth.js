/**
 * Created by Home Laptop on 03-Jun-17.
 */
var express = require('express');
var router = express.Router();

var user = require('../../model/user');
var jwt = require('../core/jwt');

function Gateway(req, res, next) {
    var Token = readToken(req, pubConfig.TokenTag);
    
    if (Token) {
        user.Authenticate(Token,function (err, ID) {
            if (err){
                delete req.cookies[pubConfig.TokenTag];
                delete req.headers[pubConfig.TokenTag];
                handleError(err, res);
            }
            else {
                req.UserId = ID;
                next();
            }
        });
    }
    else {
        writeLogin(res);
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

function handleError(err, res) {
    if (err == user.ErrorCode.AuthenticationFailed){
        writeUnauthorized(res);
    }
    else {
        writeInternalError(res);
    }
}

function writeLogin(res) {
    var Response = {Code: statusCodes.Unauthorized, Message: 'Login Required'};
    res.writeHead(statusCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

function writeUnauthorized(res) {
    var Response = {Code: statusCodes.Unauthorized, Message: 'Unauthorized, Please Login'};
    res.writeHead(statusCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

function writeInternalError(res) {
    res.writeHead(statusCodes.InternalError,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

router.use(Gateway);

module.exports = router;