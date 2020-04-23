let User = require('../../models/user.models')

function index(req, res, next) {
    res.render('auth/passwords/email')
}

function sendsPasswordResetEmails(req, res, next) {

}

module.exports = {
    index,
    sendsPasswordResetEmails,
}