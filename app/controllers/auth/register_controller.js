const { APP_NAME } = require('../../../config/app');
const UserService = require('../../services/user_service');

async function index(req, res, next) {
    res.render('auth/register', {
        title: APP_NAME + ' - Sign Up'
    })
}

async function register(req, res, next) {
    let userData = req.body
    // validate user information
    const {error} = UserService.validate(userData);
    if (error) {
        res.render('auth/register', {
            title: APP_NAME + ' - Sign Up',
            error: 'Invalid input'
        })
    }

    // create new user
    UserService.create(userData)
        .then(r => {
            req.flash('success', 'Welcome, ' + userData.username);
            req.session.username = userData.username;
            req.session.email = userData.email;
            res.redirect('/');
        })
        .catch(err => {
            res.render('auth/register', {
                title: APP_NAME + ' - Sign Up',
                username: userData.username,
                email: userData.email,
                password: userData.password,
                password_confirm: userData.password_confirm,
                error: err
            })
        })
}


module.exports = {
    index,
    register,
}