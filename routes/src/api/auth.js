/**
 * Created by Home Laptop on 03-Jun-17.
 */

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
    var Response = {Code: statusCodes.Unauthorized, Message: 'Login Required'};
    res.writeHead(statusCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

function writeUnauthorized(res) {
    var Response = {Code: statusCodes.Unauthorized, Message: 'Unauthorized, Please Login'};
    res.writeHead(statusCodes.Unauthorized,{'Content-Type':'text/json'});
    res.end(JSON.stringify(Response));
}

module.exports.auth = auth;
module.exports.adminAuth = adminAuth;
