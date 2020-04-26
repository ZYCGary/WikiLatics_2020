const User = require('../user.model');
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const {HASHING_SALT} = require('../../../config/hashing');

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


async function create(userData) {
    // validate
    if (await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }] })) {
        throw 'Username/Email is already taken';
    }

    // hash user password
    userData.password = bcrypt.hashSync(userData.password, HASHING_SALT);

    const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password
    })

    await newUser.save();
}