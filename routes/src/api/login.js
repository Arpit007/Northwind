/**
 * Created by Home Laptop on 07-Jun-17.
 */
'use strict';

var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.post('/*',function (req, res) {
    if (req.Token){
        if (req.query.redirect)
            res.redirect(req.query.redirect);
        else
            res.json({Code : statusCodes.Ok , Message : 'Success', Token : req.Token});
        return;
    }
    
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
    user.Login(UserName, Password, function (err, Token, ID) {
        if (err){
            handleError(err, res);
        }
        else {
            memCached.set(Token,{UserId : ID, host : clientIP(req)}, maxConcurrentSession, function (err) {
                if (err)
                    console.log(err);
                
                if (req.query.redirect)
                    res.redirect(req.query.redirect);
                else
                    res.json({Code : statusCodes.Ok , Message : 'Success', Token : Token});
            });
        }
    });
});

function writeErrorMessage(Message, res) {
    res.json({Code : statusCodes.BadRequest , Message : Message});
}

function handleError(err, res) {
    if (err === ErrorCode.UserDoesNotExists || err === ErrorCode.InvalidPassword){
        res.json({Code : statusCodes.BadRequest , Message : 'User/Password do not match'});
    }
    else {
        res.json({Code: statusCodes.Unauthorized, Message: 'Internal Error'});
    }
}

module.exports = router;