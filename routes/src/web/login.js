/**
 * Created by Home Laptop on 08-Jun-17.
 */
'use strict';

var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/',function (req, res) {
    if (req.Token){
        if (req.query.redirect)
            res.redirect(req.query.redirect);
        else res.redirect('/');
        return;
    }
    res.render('login')
});


router.post('/auth',function (req, res) {
    if (req.Token){
        if (req.query.redirect)
            res.redirect(req.query.redirect);
        else res.redirect('/');
        return;
    }
    var UserName = req.body.UserName;
    var Password = req.body.Password;
    if (!UserName){
        res.render('errorMessage', {Message : 'Enter a Username'});
        return;
    }
    if (!Password){
        res.render('errorMessage', {Message : 'Enter a Password'});
        return;
    }
    if (Password.length < pubConfig.MinPasswordLength || Password.length > pubConfig.MaxPasswordLength){
        res.render('errorMessage', {Message : 'Invalid Password Length'});
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
                
                res.cookie(pubConfig.TokenTag, Token);
                if (req.query.redirect)
                    res.redirect(req.query.redirect);
                else res.redirect('/');
            });
        }
    });
});

function handleError(err, res) {
    if (err === ErrorCode.UserDoesNotExists || err === ErrorCode.InvalidPassword){
        res.render('errorMessage', {Message : 'User/Password do not match'});
    }
    else {
        res.render('errorMessage', {Message : 'Internal Error'});
    }
}

module.exports = router;