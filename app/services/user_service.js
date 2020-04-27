const User = require('@models/user_model')
const bcrypt = require('bcryptjs')
const {HASHING_SALT} = require('@config/hashing')

/**
 * Create a new user
 */
const create = (userData) => {
    return new Promise((resolve, reject) => {
        // validate existence
        User.findOne({$or: [{'local.username': userData.username}, {'local.email': userData.email}]})
            .then(user => {
                // user has registered
                if (user)
                    resolve(false)
                // no duplicate user found, put this new user into the database
                else {
                    // hash user password
                    userData.password = bcrypt.hashSync(userData.password, HASHING_SALT)

                    const newUser = new User({
                        'local.username': userData.username,
                        'local.email': userData.email,
                        'local.password': userData.password,
                    })

                    newUser.save().then(newUser => {
                        resolve(newUser)
                    })
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * validate input password with user's password
 */
const validatePassword = (password, userPassword) => {
    return bcrypt.compareSync(password, userPassword)
}

module.exports = {
    create,
    validatePassword
}