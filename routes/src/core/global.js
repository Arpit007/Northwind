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

function checkDebugEnvironment() {
    if (process.env['NODE_ENV'])
        return (process.env['NODE_ENV'] === 'development');
    return true;
}

global.DebugMode = checkDebugEnvironment();
global.ReleaseMode = !DebugMode;
global.pvtConfig = require('../../config/pvtConfig');
global.pubConfig = require('../../config/pubConfig');
global.statusCodes = require('./statusCodes');
global.ErrorCode = require('../../model/ErrorCode');