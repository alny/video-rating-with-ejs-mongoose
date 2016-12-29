var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');
var mongoose = require('mongoose');
var flash = require('express-flash');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var clc = require('cli-color');



var routes = require('./routes/index');
var users = require('./routes/users');
var frags = require('./routes/frags');


var secret = require('./config/secret');


mongoose.connect(secret.database, function(err){
  if(err){
    console.log(err)
  }else{
    console.log(clc.yellow('Tilsluttet til databasen'));
  }
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: true,
  saveUninitialized: true,
  cookie:{maxAge:60000*24*60},
  secret: secret.secretKey,
  store: new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.numbers = [1,2,3,4,5,6,7,8,9,10];
  res.locals.dynamicTitle = req.dynamicTitle;
  next();
});

app.use(routes);
app.use(frags);
app.use(users);


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
