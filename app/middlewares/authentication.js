const { SESSION_NAME } = require('../../config/session');

/*
* This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
* This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
*/
module.exports.checkCookie = function (req, res, next) {
    if (req.cookies[SESSION_NAME] && !req.session.username) {
        res.clearCookie(SESSION_NAME);
    }
    next();
}

/*
* Middleware function to check for logged-in users
*/
module.exports.loggedIn = function (req, res, next) {
    if (req.cookies[SESSION_NAME] && req.session.username) {
        next();
    } else {
        req.flash('warning', 'Please login first')
        res.redirect('/login')
    }
}