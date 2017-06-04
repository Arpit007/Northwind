/**
 * Created by Home Laptop on 04-Jun-17.
 */
var crypto = require('crypto');
var fs = require('fs');

var pvtConfig = require('../config/pvtConfig');
var pubConfig = require('../config/pubConfig');

var algo1 = "aes192";
var algo2 = "aes256";

var encrypt = function (object) {
    var cipher = crypto.createCipheriv('aes-256-ecb', pvtConfig.TokenKey,"");
    return cipher.update(object, 'utf8', 'base64') + cipher.final('base64');
};

var decrypt = function (object) {
    var decipher = crypto.createDecipher('aes-256-ecb', pvtConfig.TokenKey,"");
    return decipher.update(object, 'base64', 'utf8') + decipher.final('utf8');
};

var encryptWithSalt = function(object){
    var salt = crypto.randomBytes(pvtConfig.TokenSaltLength).toString();
    var cipher = crypto.createCipher(algo1, salt);
    var intermediate = cipher.update(object, 'utf8', 'base64') + cipher.final('base64');
    
    intermediate = intermediate + salt;
    
    cipher = crypto.createCipher(algo2, pvtConfig.TokenKey);
    return cipher.update(intermediate, 'utf8', 'base64') + cipher.final('base64');
};

var decryptWithSalt = function(object){
    var decipher = crypto.createDecipher(algo2, pvtConfig.TokenKey);
    var intermediate = decipher.update(object, 'base64', 'utf8') + decipher.final('utf8');
    
    var  index = intermediate.length - pvtConfig.TokenSaltLength;
    
    var data = intermediate.substr(0, index);
    var salt = intermediate.substr(index);
    
    decipher = crypto.createDecipher(algo1, salt);
    return decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
};

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptWithSalt = encryptWithSalt;
module.exports.decryptWithSalt = decryptWithSalt;