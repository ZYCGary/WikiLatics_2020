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


async function create(userData) {
    // validate
    if (await User.findOne({username: userData.email})) {
        throw 'Email/Username is already taken';
    }

    // hash user password
    /*await bcrypt.genSalt(10, function (err, salt) {
        if (err)
            console.log(err)
        bcrypt.hash(userData.password, salt, function (err, hash) {
            if (err)
                console.log(err);
            userData.password = hash;
        })
    })*/
    userData.password = bcrypt.hashSync(userData.password, 8);

    const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password
    })

    await newUser.save();
}