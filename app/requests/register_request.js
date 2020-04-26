const {APP_NAME} = require('../../config/app')
const authConfig = require('../../config/auth')
const {Joi, validate} = require('./request')

const messages = {
    username: {
        "string.base": 'Username should be a type of text',
        "string.empty": 'Username cannot be an empty field',
        "string.min": 'Username should have a minimum length of {#limit}',
        "string.max": 'Username should have a maximum length of {#limit}',
        "any.required": 'Username is a required field'
    }
}

const rules = {
    username: Joi.string()
        .min(authConfig.username.min)
        .max(authConfig.username.max)
        .required()
        .messages(messages.username),
    email: Joi.string()
        .min(authConfig.email.min)
        .max(authConfig.email.max)
        .required()
        .email(),
    password: Joi.string()
        .min(authConfig.password.min)
        .max(authConfig.password.min)
        .required(),
    password_confirm: Joi.any()
        .valid(Joi.ref('password'))
        .required()
}

const errorHandler = function (error, req, res, next) {
    res.render('auth/register', {
        title: APP_NAME + ' - Sign Up',
        old_username: req.body.username,
        old_email: req.body.email,
        old_password: req.body.password,
        old_password_confirm: req.body.password_confirm,
        error: error
    })
}


module.exports = function (req, res, next) {
    validate(req, res, next, rules, errorHandler)
}