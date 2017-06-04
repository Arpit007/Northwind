/**
 * Created by Home Laptop on 04-Jun-17.
 */
var security = require('../base/security');

var getToken = function(payload)
{
    payload = payload || {};
    
    if (typeof payload !== 'object')
        throw Error("Invalid Payload");
    
    try {
        var content = JSON.stringify(payload);
        return security.encryptWithSalt(content);
    }
    catch (e){
        console.log(e);
        return null;
    }
};

var getPayload = function (token) {
    try {
        var content = security.decryptWithSalt(token);
        return JSON.parse(content);
    }
    catch (e)
    {
        return {};
    }
};

var Payload = function () {
    return {
        auth:  0
        //agent: req.headers['user-agent'],
        //exp:   opts.expires || pubConfig.TokenExpire
    };
};

module.exports.getToken = getToken;
module.exports.getPayload = getPayload;
module.exports.Payload = Payload;