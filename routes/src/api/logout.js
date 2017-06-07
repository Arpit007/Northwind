var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.post('/*',function (req, res) {
    var Token = readToken(req, pubConfig.TokenTag);
    if(!Token){
        handleError(user.ErrorCode.InvalidRequest, res);
        return;
    }
    user.Logout(Token, function (err, Success) {
        if (err){
            handleError(err,res);
            return;
        }
        res.writeHead(statusCodes.Ok, {'Content-Type' : 'text/json'});
        res.end(JSON.stringify({Code : statusCodes.Ok , Message : 'Success'}));
    })
});

function handleError(err, res) {
    if (err == user.ErrorCode.InvalidRequest){
        res.writeHead(statusCodes.BadRequest, { 'Content-Type' : 'text/json' });
        res.end(JSON.stringify({ Code : statusCodes.BadRequest, Message : 'Invalid Request' }));
    }
    else {
        res.writeHead(statusCodes.BadRequest, { 'Content-Type' : 'text/json' });
        res.end(JSON.stringify({ Code : statusCodes.BadRequest, Message : 'Internal Error' }));
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

module.exports = router;
