/**
 * Created by Home Laptop on 04-Jun-17.
 */
'use strict';

var security = require('./security');

/**
* Northwind Web Token
* */
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

/**
 * Get Payload From Nwt.Token
 * Empty Payload on Error
 * May return error
 **/
module.exports.getToken = getToken;

/**
 * Get Token on Encrypting Nwt.Payload
 * May return null
 * May Throw Error
 **/
module.exports.getPayload = getPayload;

/**
 * Custom Nwt Payload
 * */
module.exports.Payload = Payload;