/**
 * Created by Home Laptop on 04-Jun-17.
 */
var crypto = require('crypto');
var pubConfig = require('../config/pubConfig');
var pvtConfig = require('../config/pvtConfig');

var getToken = function(payload)
{
    payload = payload || {};
    
    if (typeof payload !== 'object')
        throw Error("Invalid Payload");
    
    try {
        var content = JSON.stringify(payload);
        var salt = crypto.randomBytes(8).toString();
        var cipher = crypto.createCipher('blowfish', salt);
        var intermediate = cipher.update(content, 'utf8', 'base64') + cipher.final('base64');
    
        intermediate = intermediate + '.' + salt;
    
        cipher = crypto.createCipher('aes192', pvtConfig.TokenKey);
        return cipher.update(intermediate, 'utf8', 'base64') + cipher.final('base64');
    }
    catch (e){
        console.log(e);
        return null;
    }
};

var getPayload = function (token) {
    try {
        var decipher = crypto.createDecipher('aes192', pvtConfig.TokenKey);
        var intermediate = decipher.update(token, 'base64', 'utf8') + decipher.final('utf8');
    
        var index = intermediate.lastIndexOf('.');
    
        var data = intermediate.substr(0, index);
        var salt = intermediate.substr(index + 1);
    
        decipher = crypto.createDecipher('blowfish', salt);
        var content = decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
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