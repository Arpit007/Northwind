'use strict';

var fs = require('fs');
var clone = require('clone');
var chokidar = require('chokidar');

var pubConfig = require('./pubConfig');
var pvtConfigPath = './config/pvtConfig.json';

var tempConfig = {
    TokenKey : process.env.TokenKey || fs.readFileSync('./config/key.pem').toString(),
    TokenSaltLength : 16,
    MongoUrl :  process.env.MONGODB_URI || "mongodb://localhost:27017/" + pubConfig.appName,
    MemCachedUrl : process.env.MEMCACHED_URI || 'localhost:11211',
    ConcurrentSessionCount : 3,
    PasswordIterations : 4
};

var config = tempConfig;

var update = function () {
    try {
        var temp = clone(tempConfig);
        var readConfig = JSON.parse(fs.readFileSync(pvtConfigPath, 'utf8'));
        for (var key in readConfig){
            temp[key] = readConfig[key] || temp[key] || '';
        }
        if (temp.PasswordIterations<3)
            temp.PasswordIterations=3;
        
        if (temp.PasswordIterations>9)
            temp.PasswordIterations=9;
        config = temp;
    }
    catch (e){
        console.log(e);
        config = tempConfig;
    }
};

try {
    update();
    chokidar.watch(pvtConfigPath)
        .on('change',function (path) {
            update();
        });
}
catch (e){
    console.log(e);
}

module.exports = config;