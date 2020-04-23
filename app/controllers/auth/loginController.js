let User = require('../../models/user.models')

function index(req, res, next) {
    res.render('auth/login')
}

function login(req, res, next) {

}

module.exports = {
    index,
    login,
}