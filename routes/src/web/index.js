/**
 * Created by Home Laptop on 24-Jun-17.
 */
'use strict';

var fs = require('fs');
var cors = require('cors');
var chokidar = require('chokidar');
var router = require('express').Router();

var gateway = require('../core/gateway');
var auth = require('./auth');

var whiteListPath = 'config/whiteList.json';
var whiteList = [];

var update = function () {
    try {
        var tempWhiteList = JSON.parse(fs.readFileSync(whiteListPath, 'utf8'));
        if (tempWhiteList)
            whiteList = tempWhiteList;
    }
    catch (e){
        console.log(e);
    }
};

try {
    chokidar.watch(whiteListPath)
        .on('add',function (path) {
            update();
        })
        .on('change',function (path) {
            update();
        });
}
catch (e){
    console.log(e);
}

var corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

router.options('*', cors());
router.use(cors(corsOptions));

/*Non Gateway Web Calls Here*/



/*Web Calls using Gateway i.e. Identification of User*/
router.use(gateway);

router.use('/login',require('./login'));
router.use('/logout',require('./logout'));
router.use('/signup',require('./signup'));

router.get('/', function(req, res, next) {
    res.render('index', { title: pubConfig.appName });
});

/*API requiring Authorization*/

module.exports = router;