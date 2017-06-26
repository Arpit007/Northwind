/**
 * Created by Home Laptop on 04-Jun-17.
 */
'use strict';

var fs = require('fs');
var clone = require('clone');
var chokidar = require('chokidar');

var pubConfigPath = './config/pubConfig.json';

var tempConfig = {
    appName : 'Northwind' || process.env.appName,
    TokenTag : 'nwt',
    MinPasswordLength : 8,
    MaxPasswordLength : 16,
    maxConcurrentSession : 1800
};

var config = tempConfig;

var update = function () {
    try {
        var temp = clone(tempConfig);
        var readConfig = JSON.parse(fs.readFileSync(pubConfigPath, 'utf8'));
        for (var key in readConfig){
            temp[key] = readConfig[key] || temp[key] || '';
        }
        config = temp;
    }
    catch (e) {
        console.log(e);
        config = tempConfig;
    }
    global.maxConcurrentSession = config.maxConcurrentSession;
    global.appName = config.appName;
};

try {
    update();
    chokidar.watch(pubConfigPath)
        .on('change',function (path) {
            update();
        });
}
catch (e){
    console.log(e);
}


module.exports = config;