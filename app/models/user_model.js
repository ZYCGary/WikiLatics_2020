const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const {HASHING_SALT} = require('@config/hashing')

const collectionName = "users";
const schema = {
    // passport-local schema
    local: {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            minlength: 5,
            maxlength: 255,
        },
        password: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 255,
            select: false
        }
    }
};
const UserSchema = mongoose.Schema(schema);

UserSchema.statics.create = (userData) => {
    return new Promise((resolve, reject) => {
        // validate existence
        this.findOne({$or: [{'local.username': userData.username}, {'local.email': userData.email}]})
            .then(user => {
                if (user)
                    resolve(false)

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
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = mongoose.model(collectionName, UserSchema);