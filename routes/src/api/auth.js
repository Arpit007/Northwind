/**
 * Created by Home Laptop on 03-Jun-17.
 */
'use strict';

function auth(req, res, next) {
    if(req.UserId){
        next();
    }
    else {
        writeLogin(res);
    }
}

function adminAuth(req, res, next) {
    if(req.UserId){
        if (req.IsAdmin){
            next();
        }
        else {
            writeUnauthorized(res);
        }
    }
    else {
        writeLogin(res);
    }
}

function writeLogin(res) {
    res.json({Code: statusCodes.Unauthorized, Message: 'Login Required'});
}

function writeUnauthorized(res) {
    res.json({Code: statusCodes.Unauthorized, Message: 'Unauthorized, Please Login'});
}

module.exports.auth = auth;
module.exports.adminAuth = adminAuth;
