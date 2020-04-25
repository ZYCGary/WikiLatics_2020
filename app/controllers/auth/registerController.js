const UserService = require('../../services/user.service')

async function index(req, res, next) {
    res.render('auth/register')
}

async function register(req, res, next) {
    let userData = req.body
    // validate user information
    const {error} = UserService.validate(userData);
    if (error) {
        res.render('/register', {
            error: 'Invalid input'
        })
    }

    // create new user
    UserService.create(userData)
        .then(r => {
            req.flash('success', 'Welcome ' + userData.username);
            req.session.username = userData.username;
            req.session.email = userData.email;
            res.redirect('/');
        })
        .catch(err => {
            req.flash('error', err);
            res.redirect('/register')
        })
}

module.exports = {
    index,
    register,
}