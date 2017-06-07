/**
 * Created by Home Laptop on 07-Jun-17.
 */
var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.post('/*', function (req, res) {
    var UserName = req.body.UserName || '';
    var Password = req.body.Password || '';
    var FirstName = req.body.FirstName || '';
    var MiddleName = req.body.MiddleName || '';
    var LastName = req.body.LastName || '';
    var IsAdmin = req.body.IsAdmin || false;
    
    if (!UserName) {
        writeErrorMessage('Username Required', res);
        return;
    }
    if (!Password) {
        writeErrorMessage('Password Required', res);
        return;
    }
    if (Password.length < pubConfig.MinPasswordLength || Password.length > pubConfig.MaxPasswordLength) {
        writeErrorMessage('Invalid Password Length', res);
        return;
    }
    //Todo: Check Strong Password
    if (!FirstName) {
        writeErrorMessage('First Name Required', res);
        return;
    }
    var SignUp = new user({
        Username : UserName,
        Password : Password,
        FirstName : FirstName,
        MiddleName : MiddleName,
        LastName : LastName,
        IsAdmin : IsAdmin
    });
    SignUp.Register(function (err, Token) {
        if (err){
            handleError(err, res);
            return;
        }
        res.writeHead(statusCodes.Ok, {'Content-Type' : 'text/json'});
        res.end(JSON.stringify({Code : statusCodes.Ok , Message : 'Success', Token : Token}));
    });
});

function handleError(err, res) {
    if (err == user.ErrorCode.UserAlreadyExists){
        res.writeHead(statusCodes.BadRequest, { 'Content-Type' : 'text/json' });
        res.end(JSON.stringify({ Code : statusCodes.BadRequest, Message : 'User Already Exists' }));
    }
    else {
        res.writeHead(statusCodes.BadRequest, { 'Content-Type' : 'text/json' });
        res.end(JSON.stringify({ Code : statusCodes.BadRequest, Message : 'Registration Failed' }));
    }
}

function writeErrorMessage(Message, res) {
    res.writeHead(statusCodes.BadRequest, { 'Content-Type' : 'text/json' });
    res.end(JSON.stringify({ Code : statusCodes.BadRequest, Message : Message }));
}

module.exports = router;