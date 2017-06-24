/**
 * Created by Home Laptop on 24-Jun-17.
 */
var Promise = require('bluebird');

global.createPromise = function () {
  return new Promise(function (resolve, reject) {
     resolve({});
  });
};

global.clientIP = function (req) {
    return req.headers['x-forwarded-for'] ||
        req.connection['remoteAddress'] ||
        req.socket['remoteAddress'] ||
        req.connection.socket['remoteAddress'];
};

global.pvtConfig = require('../../config/pvtConfig');
global.pubConfig = require('../../config/pubConfig');
global.statusCodes = require('./statusCodes');
