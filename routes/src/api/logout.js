var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/*',function (req, res) {
    var Token = req.Token;
    if(!Token){
        handleError(user.ErrorCode.InvalidRequest, res);
        return;
    }
    user.Logout(Token, function (err, Success) {
        if (err){
            handleError(err,res);
            return;
        }
        
        delete req.cookies[pubConfig.TokenTag];
        
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

module.exports = router;
