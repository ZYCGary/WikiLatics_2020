const { SESSION_KEY } = require('../../config/session');

/*
* This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
* This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
*/
function checkCookie(req, res, next) {
    if (req.cookies[SESSION_KEY] && !req.session.user) {
        res.clearCookie(SESSION_KEY);
    }
    next();
}

/*
* Middleware function to check for logged-in users
*/
function loggedIn(req, res, next) {
    if (req.session.username && req.cookies[SESSION_KEY]) {
        next();
    } else {
        req.flash('info', 'Please login first')
        res.redirect('/login')
    }
}

module.exports = checkCookie
module.exports = loggedIn