/**
 * Created by Home Laptop on 04-Jun-17.
 */

var config = {
    appName : 'Northwind' || process.env.appName,
    TokenTag : 'jwt',
    TokenExpire : Math.floor(new Date().getTime()/1000) + 7*24*60*60    //7 Days
};

module.exports = config;