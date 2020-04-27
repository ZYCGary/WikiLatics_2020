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
    password: Joi.string()
        .min(authConfig.password.min)
        .max(authConfig.password.max)
        .required(),
}

const errorHandler = async function (error, req, res, next) {
    res.render('auth/login', {
        title: APP_NAME + ' - Log In',
        old_username: req.body.username,
        old_password: req.body.password,
        error: req.flash('error').toString()
    })
}


module.exports = function (req, res, next) {
    validate(req, res, next, rules, errorHandler)
}