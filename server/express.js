require('module-alias/register')

const dependencies = {
    createError: require('http-errors'),
    express: require('express'),
    app: require('express')(),
    path: require('path'),
    logger: require('morgan'),
    favicon: require('serve-favicon'),
    cookieParser: require('cookie-parser'),
    session: require('express-session'),
    passport: require('passport'),
    flash: require('connect-flash'),
}

module.exports = dependencies