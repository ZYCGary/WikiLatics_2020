const {app, session} = require('./express')
const sessionConfig = require('@config/session')

app.use(session({
    name: sessionConfig.SESSION_NAME,
    secret: sessionConfig.SESSION_SECRET,
    cookie: {
        maxAge: sessionConfig.SESSION_MAXAGE
    },
    resave: sessionConfig.SESSION_RESAVE,
    saveUninitialized: sessionConfig.SESSION_SAVEUNINITIALIZED
}))

module.exports = app