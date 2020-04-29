const {SESSION_NAME} = require('@config/session')

/*
* This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
* This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
*/
const checkCookie = async (req, res, next) => {
    if (req.cookies[SESSION_NAME] && !req.isAuthenticated()) {
        res.clearCookie(SESSION_NAME)
    }
    next()
}

/*
* Middleware function to check for logged-in users.
* This middleware is fired when pages are accessible by an logged-in user
*/
const authenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        if (req.xhr)
            req.flash('warning', 'Please login first')
        res.status(401)
        if (req.xhr) {
            res.json({message: 'Please login first'})
        } else {
            res.redirect('/login')
        }

    }
}

/**
 * Middleware to check if a user has logged out.
 * This middleware is fired when an authenticated user try to call authentication functions (register, login)
 */
const loggedOut = async (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('back')
    } else {
        next()
    }
}

module.exports = {
    checkCookie,
    authenticated,
    loggedOut
}