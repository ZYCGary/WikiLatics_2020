const {app, passport} = require('./express')
require('@config/passport')(passport)

app.use(passport.initialize())
app.use(passport.session())

module.exports = app