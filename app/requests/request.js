const Joi = require('@hapi/joi')

function validate(req, res, next, rules, errorHandler) {
    const schema = Joi.object(rules)
    const result = schema.validate(req.body)
    const {error} = result
    if (result.error) {
        errorHandler(error.message, req, res, next)
    }
    next()
}

module.exports = {
    Joi,
    validate
}