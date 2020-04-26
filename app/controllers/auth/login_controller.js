const { APP_NAME } = require('@config/app')

function index(req, res, next) {
    res.render('auth/login', {
        title: APP_NAME + ' - Log In',
        success: req.flash('success').toString(),
        error: req.flash('error').toString(),
        warning: req.flash('warning').toString()
    })
}

function login(req, res, next) {

}

module.exports = {
    index,
    login,
}