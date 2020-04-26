const { app, express, path, favicon } = require('./express')

app.use(favicon(path.join('', 'public', 'favicon.ico')))
app.use(express.static(path.join('', 'public')))
app.use('/assets', [
    express.static(path.join('', 'node_modules/jquery/dist')),
    express.static(path.join('', 'node_modules/sweetalert2/dist')),
    express.static(path.join('', 'node_modules/jquery-validation/dist')),
])

module.exports = app