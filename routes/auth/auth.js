/**
 * Created by Home Laptop on 03-Jun-17.
 */
var routes = require('./authRoutes');
var express = require('express');
var errorCodes = require('../base/errorCodes');
var config = require('../config/pubConfig');
var jwt = require('./jwt');
var router = express.Router();

routes.forEach(function (Route) {
    router.all(Route, Gateway);
});

var Sample = ['Arpit','Sanket','Akshita'];

function Gateway(req, res, next) {
    var Token = readValue(req, config.TokenTag);
    
    if (Token) {
        Authorize(Token, function (ID) {
                if (ID){
                    req.UserId = ID;
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

function Authorize(Token, callback) {
    var Payload = jwt.getPayload(Token);
        
    if (Payload.auth && Sample.indexOf(Payload.auth)!=-1) {
        callback(Payload.auth);
    }
    else{
        callback(null);
    }
}

function writeUnauthorized(res) {
    var Response = {Code: errorCodes.Unauthorized, Message: 'Unauthorized'};
    res.writeHead(errorCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

module.exports = router;