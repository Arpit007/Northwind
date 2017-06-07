/**
 * Created by Home Laptop on 07-Jun-17.
 */
/**
 * Created by Home Laptop on 07-Jun-17.
 */
var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.post('/*',function (req, res) {
    var UserName = req.body.UserName;
    var Password = req.body.Password;
    if (!UserName){
        writeErrorMessage('Enter a Username', res);
        return;
    }
    if (!Password){
        writeErrorMessage('Enter a Password', res);
        return;
    }
    if (Password.length < pubConfig.MinPasswordLength || Password.length > pubConfig.MaxPasswordLength){
        writeErrorMessage('Invalid Password Length', res);
        return;
    }
    user.Login(UserName, Password, function (err, Token) {
        if (err){
            handleError(err, res);
        }
        else {
            res.writeHead(statusCodes.Ok, {'Content-Type' : 'text/json'});
            res.end(JSON.stringify({Code : statusCodes.Ok , Message : 'Success', Token : Token}));
        }
    });
});

function writeErrorMessage(Message, res) {
    res.writeHead(statusCodes.BadRequest, {'Content-Type' : 'text/json'});
    res.end(JSON.stringify({Code : statusCodes.BadRequest , Message : Message}));
}

function handleError(err, res) {
    if (err == user.ErrorCode.UserDoesNotExists || err == user.ErrorCode.InvalidPassword){
        res.writeHead(statusCodes.BadRequest, {'Content-Type' : 'text/json'});
        res.end(JSON.stringify({Code : statusCodes.BadRequest , Message : 'User/Password do not match'}));
    }
    else {
        res.writeHead(statusCodes.InternalError,{'Content-Type':'text/json'});
        res.end(JSON.stringify({Code: statusCodes.Unauthorized, Message: 'Internal Error'}));
    }
}

module.exports = router;