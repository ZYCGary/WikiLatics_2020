const User = require('../../models/user_model')

function index(req, res, next) {
    res.render('auth/passwords/email')
}

function sendsPasswordResetEmails(req, res, next) {

}

module.exports = {
    index,
    sendsPasswordResetEmails,
}