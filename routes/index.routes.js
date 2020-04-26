const express = require('express');
const router = express.Router();

const { checkCookie } = require('../app/middlewares/authentication');
const pageController = require('../app/controllers/page_controller')
const registerController = require('../app/controllers/auth/register_controller');
const loginController = require('../app/controllers/auth/login_controller');
const forgotPasswordController = require('../app/controllers/auth/forgot_password_controller');
const registerRequest = require('../app/requests/register_request')

router.use(checkCookie);

/* GET landing page. */
router.get('/', pageController.index);

/* Auth routers */
router.get('/register', registerController.index);
router.post('/register', registerRequest, registerController.register);
router.get('/login', loginController.index);
router.post('/login', loginController.login);
router.get('/forgot-password', forgotPasswordController.index);
router.post('/forgot-password', forgotPasswordController.sendsPasswordResetEmails);

module.exports = router;
