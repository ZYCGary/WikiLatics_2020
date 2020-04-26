const {APP_NAME} = require('../../config/app')
const {Joi, validate} = require('./request')

const rules = {
    username: Joi.string().min(0).max(3).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(3).max(255).required()
}
const errorHandler = function (error, req, res, next) {
    res.render('auth/register', {
        title: APP_NAME + ' - Sign Up',
        error: error
    })
}


module.exports = function (req, res, next) {
    validate(res, req, next, rules, errorHandler)
}