const {app, path} = require('./express')

app.set('views', path.join('', 'resources/views'))
app.set('view engine', 'pug')

module.exports = app