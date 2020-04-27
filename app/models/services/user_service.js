const User = require('@models/user_model')
const bcrypt = require('bcryptjs')
const {HASHING_SALT} = require('@config/hashing')

/**
 * Create a new user
 */
const create = async (userData) => {
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

module.exports = {
    create
}