/**
 * Created by Home Laptop on 03-Jun-17.
 */
var routes = require('./authRoutes');
var express = require('express');

var router = express.Router();

var jwt = require('./jwt');
var user = require('../model/user');

routes.forEach(function (Route) {
    router.all(Route, Gateway);
});

var Sample = ['Arpit','Sanket','Akshita'];

process.Users = Sample;

function Gateway(req, res, next) {
    var Token = readValue(req, config.TokenTag);
    
    if (Token) {
        Authorize(Token, function (ID) {
                if (ID){
                    req.UserId = ID;
                    next();
                }
                else {
                    delete req.cookies[config.TokenTag];
                    delete req.headers[config.TokenTag];
                    writeUnauthorized(res);
                }
        });
    }
    else {
        writeLogin(res);
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
    try {
        var Payload = jwt.getPayload(Token);
    
        if (Payload.auth && process.Users.indexOf(Payload.auth) != -1) {
            callback(Payload.auth);
        }
        else {
            callback(null);
        }
    }
    catch (e){
        callback(null);
    }
}

function writeLogin(res) {
    var Response = {Code: statusCodes.Unauthorized, Message: 'Login Required'};
    res.writeHead(statusCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

function writeUnauthorized(res) {
    var Response = {Code: statusCodes.Unauthorized, Message: 'Unauthorized'};
    res.writeHead(statusCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

module.exports = router;