/**
 * Created by Home Laptop on 03-Jun-17.
 */

function auth(req, res, next) {
    if(req.UserId){
        next();
    }
    else {
        res.redirect('/login');
    }
}

function adminAuth(req, res, next) {
    if(req.UserId){
        if (req.IsAdmin){
            next();
        }
        else {
            res.render('errorMessage', {Message : 'Unauthorized, Login as Admin'});
        }
    }
    else {
        req.body.Redirect = req.url;
        res.redirect('/login');
    }
}

module.exports.auth = auth;
module.exports.adminAuth = adminAuth;
