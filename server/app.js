const {createError, app, express, path, logger, cookieParser, passport, flash} = require('./express')

// path setup
require('./path')

// view engine setup
require('./views')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

// session setup, MUST after 'cookieParse'
require('./session')

// passport setup, MUST after 'session'
require('./passport')

// flash setup, MUST after 'session'
require('./flash')

// routers setup
require('./routers')

// error handler
require('./error_handler')

module.exports = app
