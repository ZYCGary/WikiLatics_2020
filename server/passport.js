const {app, passport} = require('./express')

app.use(passport.initialize())
app.use(passport.session())

module.exports = app