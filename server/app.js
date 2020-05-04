const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();

// path setup
require('./path')(app, express)

// view engine setup
require('./views')(app)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

// database setup
require('./database')()

// session setup, MUST after 'cookieParse'
require('./session')(app)

// passport setup, MUST after 'session'
require('./passport')(app)

// flash setup, MUST after 'session'
require('./flash')(app)

// routers setup
require('./routers')(app)

// error handler
const {handle404, handleErrors} = require('./error_handler')
handle404(app, createError)
handleErrors(app)

module.exports = app
