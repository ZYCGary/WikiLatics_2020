const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi')

module.exports = {
    validate,
    create,
}

//function to validate user
async function validate(user) {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });

    return schema.validate(user);
}


async function create(newUser) {
    // validate
    if (await User.findOne({ username: newUser.email })) {
        throw 'Email ' + newUser.email + ' is already taken';
    }

    // hash user password
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err)
                console.log(err);
            newUser.password = hash;
        })
    })

    await User.save();
}