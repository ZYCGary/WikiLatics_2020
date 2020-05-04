const express = require('express');
const router = express.Router();

const {checkCookie, loggedOut} = require('../app/middlewares/authentication')
const pageController = require('../app/controllers/page_controller')
const registerController = require('../app/controllers/auth/register_controller')
const loginController = require('../app/controllers/auth/login_controller')
const forgotPasswordController = require('../app/controllers/auth/forgot_password_controller')
const registerRequest = require('../app/requests/register_request')
const loginRequest = require('../app/requests/login_request')

router.use(checkCookie)

/* GET landing page. */
router.get('/', pageController.index)

/* Auth routers */
router.get('/register', loggedOut, registerController.index)
router.post('/register', loggedOut, registerRequest, registerController.register)
router.get('/login', loggedOut, loginController.index)
router.post('/login', loggedOut, loginRequest, loginController.login)
router.get('/logout', loginController.logout)
router.get('/forgot-password', forgotPasswordController.index)
router.post('/forgot-password', forgotPasswordController.sendsPasswordResetEmails)

module.exports = router
