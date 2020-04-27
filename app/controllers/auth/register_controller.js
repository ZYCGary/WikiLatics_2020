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
    return passport.authenticate('local-register', {
        successRedirect : '/',
        failureRedirect : '/register',
        failureFlash : true ,
        successFlash: true
    })(req, res, next)
}


module.exports = {
    index,
    register,
}