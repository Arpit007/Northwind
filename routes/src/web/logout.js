var express = require('express');
var router = express.Router();

var user = require('../../model/user');

router.all('/*',function (req, res) {
    if(!req.Token){
        res.redirect('/');
        return;
    }
    user.Logout(Token, function (err, Success) {
        if (err){
            res.render('errorMessage', {Message : 'Internal Error'});
        }
        else {
            delete req.cookies[ pubConfig.TokenTag ];
            res.redirect('/');
        }
    })
});

module.exports = router;
