'use strict';

var fs = require('fs');
var pubConfig = require('./pubConfig');

var config = {
    TokenKey : process.env.TokenKey || fs.readFileSync('./cert.pem').toString(),
    TokenSaltLength : 16,
    MongoUrl :  process.env.MONGODB_URI || "mongodb://localhost:27017/" + pubConfig.appName,
    ConcurrentSessionCount : 3
};

module.exports = config;