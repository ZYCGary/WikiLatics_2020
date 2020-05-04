const session = require('express-session')
const sessionConfig = require('../config/session')

module.exports = (app) => {
    app.use(session({
        name: sessionConfig.SESSION_NAME,
        secret: sessionConfig.SESSION_SECRET,
        cookie: {
            maxAge: sessionConfig.SESSION_MAXAGE
        },
        resave: sessionConfig.SESSION_RESAVE,
        saveUninitialized: sessionConfig.SESSION_SAVEUNINITIALIZED
    }))
}
