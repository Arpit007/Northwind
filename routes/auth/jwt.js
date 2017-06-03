/**
 * Created by Home Laptop on 04-Jun-17.
 */
var pubConfig = require('../config/pubConfig');
var pvtConfig = require('../config/pvtConfig');
var jwt  = require('jsonwebtoken');

var getToken = function(payload)
{
    payload = payload || {};
    return jwt.sign(payload, pvtConfig.TokenKey);
};

var getPayload = function (token) {
    var decoded = {};
    try {
        decoded = jwt.verify(token, pvtConfig.TokenKey);
    } catch (e) {
        decoded = {};
    }
    return decoded;
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
