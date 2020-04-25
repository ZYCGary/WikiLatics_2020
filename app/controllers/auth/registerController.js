const UserService = require('../../services/user.service')

index = (req, res, next) => {
    res.render('auth/register')
}

register = (req, res, next) => {
    const {username, email, password} = req.body;
    let userData = {
        username: username,
        email: email,
        password: password
    }

    // validate user information
    const {error} = UserService.validate(userData);
    if (error) {
        res.render('/register', {
            error: 'Invalid input'
        })
    }

    UserService.create(userData)
        .then(r => {
            res.flash('success', 'Welcome' + username);
            req.session.username = username;
            req.session.email = data.email;
            res.redirect('/');
        })
        .catch(err => {
            req.flash('error', 'Username/Email already existed');
            res.redirect('/register')
        })
}

module.exports = {
    index,
    register,
}