const Joi = require('@hapi/joi')

const validate = async (req, res, next, rules, errorHandler) => {
    const schema = Joi.object(rules)
    const result = schema.validate(req.body)
    const {error} = result
    if (error) {
        req.flash('error', error)
        await errorHandler(error.message, req, res, next)
    }
    else{
        next()
    }
}

module.exports = {
    Joi,
    validate
}