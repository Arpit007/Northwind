/**
 * Created by Home Laptop on 04-Jun-17.
 */

var config = {
    appName : 'Northwind' || process.env.appName,
    TokenTag : 'jwt',
    MinPasswordLength : 8,
    MaxPasswordLength : 16,
    TokenExpire : Math.floor(new Date().getTime()/1000) + 7*24*60*60,    //7 Days
};


global.maxConcurrentSession = 1800;

module.exports = config;