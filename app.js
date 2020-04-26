const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', [
    express.static(path.join(__dirname, '/node_modules/jquery/dist/')),
    express.static(path.join(__dirname, '/node_modules/sweetalert2/dist/')),
    express.static(path.join(__dirname, '/node_modules/jquery-validation/dist/')),
])


// session setup
const cookieParser = require('cookie-parser');
const session = require('express-session');
const sessionConfig = require('./config/session');

app.use(cookieParser());
app.use(session({
    name: sessionConfig.SESSION_NAME,
    secret: sessionConfig.SESSION_SECRET,
    cookie: {
        maxAge: sessionConfig.SESSION_MAXAGE
    },
    resave: sessionConfig.SESSION_RESAVE,
    saveUninitialized: sessionConfig.SESSION_SAVEUNINITIALIZED
}));

// flash setup
const flash = require('connect-flash');

app.use(flash())

// routers setup
const indexRouter = require('./routes/index.routes');
const analyticsRouter = require('./routes/analytics.routes');

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
