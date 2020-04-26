const {app, flash} = require('./express')

app.use(flash())

module.exports = app