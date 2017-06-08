/**
 * Created by Home Laptop on 07-Jun-17.
 */
var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/',function (req, res) {
    if (req.Token){
     res.redirect('/');
     return;
    }
    res.render('signup')
});

router.post('/auth', function (req, res) {
    if (req.Token){
        res.redirect('/');
        return;
    }
    
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
        res.cookie(pubConfig.TokenTag, Token);
        res.redirect('/');
    });
});

function handleError(err, res) {
    if (err == user.ErrorCode.UserAlreadyExists){
        res.render('errorMessage', {Message : 'User Already Exists'});
    }
    else {
        res.render('errorMessage', {Message : 'Registration Failed'});
    }
}
module.exports = router;