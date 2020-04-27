const express = require('express');
const router = express.Router();

const pageController = require('@controllers/page_controller')
const registerController = require('@controllers/auth/register_controller')
const loginController = require('@controllers/auth/login_controller')
const forgotPasswordController = require('@controllers/auth/forgot_password_controller')
const registerRequest = require('@requests/register_request')

/* GET landing page. */
router.get('/', pageController.index)

/* Auth routers */
router.get('/register', registerController.index)
router.post('/register', registerRequest, registerController.register)
router.get('/login', loginController.index)
router.post('/login', loginController.login)
router.get('/logout', loginController.logout)
router.get('/forgot-password', forgotPasswordController.index)
router.post('/forgot-password', forgotPasswordController.sendsPasswordResetEmails)

module.exports = router
