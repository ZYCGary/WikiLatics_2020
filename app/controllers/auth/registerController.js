let User = require('../../models/user.models')

function index(req, res, next) {
    res.render('auth/register')
}

function register(req, res, next) {

}

module.exports = {
    index,
    register,
}