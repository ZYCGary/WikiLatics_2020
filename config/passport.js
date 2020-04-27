const LocalStrategy = require('passport-local').Strategy
const User = require('@models/user_model')
const UserService = require('@services/user_service')

module.exports = function (passport) {
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    /**
     * Local sign up
     */
    passport.use('local-register', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            const userData = {
                username: username,
                email: req.body.email,
                password: password
            }

            UserService.create(userData)
                .then(newUser => {
                    if (!newUser)
                        return done(null, false, req.flash('error', 'Username/Email is already been taken'))
                    return done(null, newUser, req.flash('success', 'Welcome, ' + newUser.local.username))
                })
                .catch(err => {
                    return done(err)
                })
        }));
}