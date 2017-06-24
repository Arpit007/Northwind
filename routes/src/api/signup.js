/**
 * Created by Home Laptop on 07-Jun-17.
 */
'use strict';

var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.post('/*', function (req, res) {
    if (req.Token){
        writeErrorMessage('Invalid Request', res);
        return;
    }
    
    var SignUp = SignUpUser(req, res);
    
    if (!SignUp)
        return;
    
    SignUp.Register(function (err, Token, ID) {
        if (err){
            handleError(err, res);
            return;
        }
        
        memCached.set(Token,{UserId : ID, host : clientIP(req)}, maxConcurrentSession, function (err) {
            if (err)
                console.log(err);
    
            if (req.query.redirect)
                res.redirect(req.query.redirect);
            else res.json({Code : statusCodes.Ok , Message : 'Success', Token : Token});
        });
    });
});

//User Sign Up function
function SignUpUser(req, res) {
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
    return new user({
        Username : UserName,
        Password : Password,
        FirstName : FirstName,
        MiddleName : MiddleName,
        LastName : LastName,
        IsAdmin : IsAdmin
    });
}

function handleError(err, res) {
    if (err === user.ErrorCode.UserAlreadyExists){
        res.json({ Code : statusCodes.BadRequest, Message : 'User Already Exists' });
    }
    else {
        res.json({ Code : statusCodes.BadRequest, Message : 'Registration Failed' });
    }
}

function writeErrorMessage(Message, res) {
    res.json({ Code : statusCodes.BadRequest, Message : Message });
}

module.exports = router;