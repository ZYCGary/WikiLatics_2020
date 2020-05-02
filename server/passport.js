const passport = require('passport')
require('@config/passport')(passport)

module.exports = (app) => {
    app.use(passport.initialize())
    app.use(passport.session())
}
