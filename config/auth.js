const env = require('./env')

module.exports = {
    username: {
        min: 6,
        max: 20
    },
    email: {
        min: 5,
        max: 255
    },
    password: {
        min: 8,
        max: 25
    }
}