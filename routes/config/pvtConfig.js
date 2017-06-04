var fs = require('fs');

var config = {
    TokenKey : process.env.TokenKey || fs.readFileSync('./cert.pem').toString(),
    TokenSaltLength : 16
};

module.exports = config;