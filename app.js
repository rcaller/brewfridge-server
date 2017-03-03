var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport =require('passport');
var routes = require('./routes/index');
var tempreport = require('./routes/tempreport');
var tempdata = require('./routes/tempdata');
var mysql      = require('mysql');
var myConnection = require('express-myconnection');
var dbOptions = {
  host     : 'localhost',
  port	   : 3306,
  user     : 'brewfridge',
  password : ';3R%{N{Rp5.Lq*wy',
  database : 'brewfridge',
  multipleStatements : true
}


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// passport login
app.use(require('express-session')({ secret: 'bobobob', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(myConnection(mysql, dbOptions, 'single'));
app.use('/', routes);
app.use('/tempreport', tempreport);
app.use('/tempdata', tempdata);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
