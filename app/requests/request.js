const Joi = require('@hapi/joi');

function validate(req, res, next, rules, errorHandler) {
    const schema = Joi.object({
        username: Joi.number().min(0).max(3).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });
    const result = schema.validate(req.body);
    const {error} = result;
    if (result.error) {
        errorHandler(error, req, res, next);
    }
    next();
}

module.exports = {
    Joi,
    validate
}