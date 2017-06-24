'use strict';

var router = require('express').Router();

var api = require('./src/api/index');
var web = require('./src/web/index');

router.use('/api', function (req, res, next) {
    req.api = true;
    next();
}, api);

router.use(function (req, res, next) {
    if (req.api)
        return api(req, res, next);
    else return web(req, res, next);
});

module.exports = router;