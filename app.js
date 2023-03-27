var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var predavacRouter = require('./routes/predavac');
var publikaRouter = require('./routes/publika');
//var hes = require("../Slido/public/potrebe/hashiranje");
var app = express();
//var io = require('socket.io')();
//app.io = io;
// view engine setup
app.set('posjetio', false);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use(async function (req, res, next){
  let decoded = await hes.dekriptujToken(req.cookies.cookieSesija);
  console.info(decoded);
  next();
});*/
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/predavac', predavacRouter);
app.use('/publika', publikaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
