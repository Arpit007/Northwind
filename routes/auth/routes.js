/**
 * Created by Home Laptop on 03-Jun-17.
 */
var routes = require('./authRoutes');
var express = require('express');
var errorCodes = require('../base/errorCodes');
var router = express.Router();

routes.forEach(function (Route) {
    router.all(Route, Gateway);
});

var Sample = ['Arpit','Sanket','Akshita'];

function Gateway(req, res, next) {
    var Token = readValue(req, 'jwt');
    
    if (Token) {
        Authorize(Token, function (authorized) {
                if (authorized){
                    req.UserId = Sample.indexOf(Token);
                    next();
                }
                else {
                    writeUnauthorized(res);
                }
        });
    }
    else {
        writeUnauthorized(res);
    }
}

function readValue(req, name) {
    if (req.cookies[name]) {
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

function Authorize(Token, callback) {
    if (Sample.indexOf(Token)!=-1) {
        callback(true);
    }
    else{
        callback(false);
    }
}

function writeUnauthorized(res) {
    var Response = {Code: errorCodes.Unauthorized, Message: 'Unauthorized'};
    res.writeHead(errorCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

module.exports = router;