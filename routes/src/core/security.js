/**
 * Created by Home Laptop on 04-Jun-17.
 */
'use strict';
var pvtConfig = require('../../config/pvtConfig');
var rand = require('random-key');
var crypto = require('crypto');
var fs = require('fs');

var Pass1Algo = "aes256";
var Pass2Algo = "aes192";
var PassIVAlgo = 'aes-128-cbc';
var PassIVAlgo2 = 'aes-128-ecb';
var iv = new Buffer('0000000000000000');

var encryptLongKeyExport = function (object, key) {
    var Hash = crypto.createHash('md5').update(key).digest("hex");
    var cipher = crypto.createCipheriv(PassIVAlgo, new Buffer(Hash, 'hex'), new Buffer(iv));
    return cipher.update(object, 'utf8', 'hex') + cipher.final('hex');
};

var decryptLongKeyExport = function (object, key) {
    var Hash = crypto.createHash('md5').update(key).digest("hex");
    var cipher = crypto.createDecipheriv(PassIVAlgo, new Buffer(Hash, 'hex'), new Buffer(iv));
    return cipher.update(object, 'hex', 'utf8') + cipher.final('utf8');
};

var encryptExport = function (data, key) {
    var cipher = crypto.createCipheriv(PassIVAlgo2, key,"");
    return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
};

var decryptExport = function (data, key) {
    var decipher = crypto.createDecipheriv(PassIVAlgo2, key, "");
    return decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
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
    var salt = rand.generate(pvtConfig.TokenSaltLength);
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

var encryptPassword = function(object){
    var salt = rand.generate(pvtConfig.TokenSaltLength);
    var cipher = crypto.createCipher(Pass1Algo, salt);
    var intermediate = cipher.update(object, 'utf8', 'base64') + cipher.final('base64');
    
    for (var iteration = 1; iteration<pvtConfig.PasswordIterations;iteration++) {
        cipher = crypto.createCipher(Pass1Algo, salt);
        intermediate = (cipher.update(intermediate, 'base64', 'base64') + cipher.final('base64'));
    }
    
    intermediate = intermediate + pvtConfig.PasswordIterations + salt;
    
    cipher = crypto.createCipher(Pass2Algo, pvtConfig.TokenKey);
    return cipher.update(intermediate, 'utf8', 'base64') + cipher.final('base64');
};

var comparePassword = function(value, Password){
    var decipher = crypto.createDecipher(Pass2Algo, pvtConfig.TokenKey);
    var intermediate = decipher.update(Password, 'base64', 'utf8') + decipher.final('utf8');
    
    var  index = intermediate.length - pvtConfig.TokenSaltLength - 1;
    
    var data = intermediate.substr(0, index);
    var count = intermediate.substr(index, 1);
    var salt = intermediate.substr(index + 1);
    
    var cipher = crypto.createCipher(Pass1Algo, salt);
    intermediate = cipher.update(value, 'utf8', 'base64') + cipher.final('base64');
    
    for (var iteration = 1; iteration<count;iteration++) {
        cipher = crypto.createCipher(Pass1Algo, salt);
        intermediate = (cipher.update(intermediate, 'base64', 'base64') + cipher.final('base64'));
    }
    
    return (data === intermediate);
};

module.exports ={
    Pass1Algo : Pass1Algo,
    Pass2Algo : Pass2Algo,
    encrypt : encrypt,
    decrypt : decrypt,
    encryptExport : encryptExport,
    decryptExport : decryptExport,
    encryptPassword : encryptPassword,
    comparePassword : comparePassword,
    encryptWithSalt : encryptWithSalt,
    decryptWithSalt : decryptWithSalt,
    encryptLongKeyExport : encryptLongKeyExport,
    decryptLongKeyExport : decryptLongKeyExport
};

var a = encryptPassword("Hello World");
//console.log(a);
var b = comparePassword("Hello World", a);
console.log(b);