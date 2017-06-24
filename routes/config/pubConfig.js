/**
 * Created by Home Laptop on 04-Jun-17.
 */
'use strict';

var config = {
    appName : 'Northwind' || process.env.appName,
    TokenTag : 'nwt',
    DebugMode : checkDebugEnvironment(),
    ReleaseMode : !checkDebugEnvironment(),
    MinPasswordLength : 8,
    MaxPasswordLength : 16
};


global.maxConcurrentSession = 1800;
global.appName = config.appName;

function checkDebugEnvironment() {
    if (process.env['NODE_ENV'])
        return (process.env['NODE_ENV'] === 'development');
    return false;
}

module.exports = config;