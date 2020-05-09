const favicon = require('serve-favicon')

module.exports = (app, express) => {
    app.use(favicon('public/favicon.ico'))
    app.use(express.static('public'))
    app.use('/assets', [
        express.static('node_modules/jquery/dist'),
        express.static('node_modules/sweetalert2/dist'),
        express.static('node_modules/jquery-validation/dist'),
        express.static('node_modules/chart.js/dist'),
    ])
}
