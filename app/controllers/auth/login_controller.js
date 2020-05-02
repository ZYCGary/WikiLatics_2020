const { APP_NAME } = require('../../../config/app')
const passport = require('passport')

const index = (req, res, next) => {
    res.render('auth/login', {
        title: APP_NAME + ' - Log In',
        success: req.flash('success').toString(),
        error: req.flash('error').toString(),
        warning: req.flash('warning').toString()
    })
}

const login = (req, res, next) => {
    return passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true ,
        successFlash: true
    })(req, res, next)
}

const logout = async (req, res, next) => {
    req.logout();
    res.redirect('/');
}

module.exports = {
    index,
    login,
    logout
}
