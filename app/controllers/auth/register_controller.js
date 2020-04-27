const {APP_NAME} = require('@config/app')
const passport = require('passport')
const User = require('@services/user_service')

const index = (req, res, next) => {
    res.render('auth/register', {
        title: APP_NAME + ' - Sign Up',
        error: req.flash('error').toString()
    })
}

const register = (req, res, next) => {
    return passport.authenticate('local-register', (err, user, info) => {
        if (err) {
            return next(err)
        }
        // applied user exists, back to register page
        if (!user) {
            req.flash('error', info.message)
            return res.redirect('/register')
        }
        // successfully register, redirect to landing page
        req.session.username = user.local.username
        req.session.email = user.local.email
        req.flash('success', 'Welcome ' + user.local.username)
        res.redirect('/');
    })(req, res, next)
}


module.exports = {
    index,
    register,
}