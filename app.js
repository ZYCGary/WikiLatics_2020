const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sessionConfig = require('./config/session');
const session = require('express-session');
const flash = require('connect-flash');

const indexRouter = require('./app/routes/index.routes');
const analyticsRouter = require('./app/routes/analytics.routes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', [
    express.static(path.join(__dirname, '/node_modules/jquery/dist/')),
    express.static(path.join(__dirname, '/node_modules/bootstrap/dist/')),
    express.static(path.join(__dirname, '/node_modules/@fortawesome/')),
    express.static(path.join(__dirname, '/node_modules/sweetalert2/dist/')),
    express.static(path.join(__dirname, '/node_modules/jquery-validation/dist/')),
])


// session setup
app.use(session({
    key: sessionConfig.SESSION_KEY,
    secret: sessionConfig.SESSION_SECRET,
    cookie: {expires: parseInt(sessionConfig.SESSION_EXPIRES)},
    resave: sessionConfig.SESSION_RESAVE === 'true',
    saveUninitialized: sessionConfig.SESSION_SAVEUNINITIALIZED === 'true'
}));

// flash setup
app.use(flash())

app.use('/', indexRouter);
app.use('/analytics', analyticsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
