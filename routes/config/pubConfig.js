/**
 * Created by Home Laptop on 04-Jun-17.
 */
'use strict';

var config = {
    appName : 'Northwind' || process.env.appName,
    TokenTag : 'nwt',
    MinPasswordLength : 8,
    MaxPasswordLength : 16
};


global.maxConcurrentSession = 1800;
global.appName = config.appName;

module.exports = config;