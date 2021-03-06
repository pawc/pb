var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var seq = require('./sequelize.js');

var app = express();
var server = require('http').createServer(app);

server.listen(3000);

var crypto = require('./utils/crypto.js');

var session = require('express-session')({
	secret: crypto.generateSalt(16),
	resave: false,
	saveUninitialized: false,
	/*cookie: {
		maxAge: 60000
	}*/
});

app.use(session);

var socket = require('./socket.js')(server, session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var privateMessageRouter = require('./routes/privateMessage');

seq.populate();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/public', express.static(__dirname + '/public/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use('/easy-autocomplete', express.static(__dirname + '/node_modules/easy-autocomplete/dist/'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/messages', privateMessageRouter);

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