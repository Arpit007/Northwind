var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var gateway = require('./routes/src/core/gateway');
var api = require('./routes/src/api');
var web = require('./routes/src/web');

var app = express();
app.locals.appName = pubConfig.appName;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(gateway, function (req, res, next) {
    req.jsonResponse = !!(req.headers['content-type'] && req.headers['content-type'] == 'application/json');
    next();
});

app.use('/api',function (req, res, next) {
    req.jsonResponse = true;
    next();
}, api);


app.use(function (req, res, next) {
   if(req.jsonResponse)
       return api(req, res, next);
   else return web(req, res, next);
});


app.use(function(req, res, next) {
  var err = new Error('Not Found' + req.url);
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
