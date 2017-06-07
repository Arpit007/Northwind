/**
 * Created by Home Laptop on 04-Jun-17.
 */
var crypto = require('crypto');
var fs = require('fs');

var Pass1Algo = "aes256";
var Pass2Algo = "aes192";

var encryptiv = function (object, iv) {
    var IV = iv || "";
    var cipher = crypto.createCipheriv('aes-256-ecb', pvtConfig.TokenKey,IV);
    return cipher.update(object, 'utf8', 'base64') + cipher.final('base64');
};

var decryptiv = function (object, iv) {
    var IV = iv || "";
    var decipher = crypto.createDecipher('aes-256-ecb', pvtConfig.TokenKey,IV);
    return decipher.update(object, 'base64', 'utf8') + decipher.final('utf8');
};

var encrypt = function (object, algorithm, key) {
    var algo = algorithm || Pass2Algo;
    var Salt = key || pvtConfig.TokenKey;
    var cipher = crypto.createCipher(algo, Salt);
    return cipher.update(object, 'utf8', 'base64') + cipher.final('base64');
};

var decrypt = function (object, algorithm, key) {
    var algo = algorithm || Pass2Algo;
    var Salt = key || pvtConfig.TokenKey;
    var decipher = crypto.createDecipher(algo, Salt);
    return decipher.update(object, 'base64', 'utf8') + decipher.final('utf8');
};

var encryptWithSalt = function(object){
    var salt = crypto.randomBytes(pvtConfig.TokenSaltLength).toString();
    var cipher = crypto.createCipher(Pass1Algo, salt);
    var intermediate = cipher.update(object, 'utf8', 'base64') + cipher.final('base64');
    
    intermediate = intermediate + salt;
    
    cipher = crypto.createCipher(Pass2Algo, pvtConfig.TokenKey);
    return cipher.update(intermediate, 'utf8', 'base64') + cipher.final('base64');
};

var decryptWithSalt = function(object){
    var decipher = crypto.createDecipher(Pass2Algo, pvtConfig.TokenKey);
    var intermediate = decipher.update(object, 'base64', 'utf8') + decipher.final('utf8');
    
    var  index = intermediate.length - pvtConfig.TokenSaltLength;
    
    var data = intermediate.substr(0, index);
    var salt = intermediate.substr(index);
    
    decipher = crypto.createDecipher(Pass1Algo, salt);
    return decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
};

module.exports ={
    Pass1Algo : Pass1Algo,
    Pass2Algo : Pass2Algo,
    encryptiv : encryptiv,
    decryptiv : decryptiv,
    encrypt : encrypt,
    decrypt : decrypt,
    encryptWithSalt : encryptWithSalt,
    decryptWithSalt : decryptWithSalt
};
