var fs = require('fs');

var config = {
    TokenKey : fs.readFileSync('./cert.pem').toString()
};

module.exports = config;