/**
 * Created by Home Laptop on 24-Jun-17.
 */
'use strict';

var router = require('express').Router();

var gateway = require('../core/gateway');
var auth = require('./auth');

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