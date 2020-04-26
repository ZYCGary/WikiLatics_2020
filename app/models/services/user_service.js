const User = require('../user_model')
const bcrypt = require('bcryptjs')
const Joi = require('@hapi/joi')
const {HASHING_SALT} = require('../../../config/hashing')

module.exports = {
    create
}

async function create(userData) {
    // validate existence
    if (await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }] })) {
        throw 'Username/Email is already taken'
    }

    // hash user password
    userData.password = bcrypt.hashSync(userData.password, HASHING_SALT)

    const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password
    })

    await newUser.save()
}