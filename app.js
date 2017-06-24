'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');

var index = require('./routes/index');

var app = express();
app.locals.appName = pubConfig.appName;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(helmet());
app.use(logger('dev'));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    req.api = ([ req.headers[ 'response-type' ], req.body[ 'response-type' ], req.query[ 'response-type' ] ]
        .indexOf('text/json') !== -1);
    next();
});

app.use('/', index);

app.use(function (req, res, next) {
    var err = new Error('Not Found ' + req.url);
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    if (req.api) {
        res.json({ Code : err.status || 500, Message : err.message });
    } else {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = app;
